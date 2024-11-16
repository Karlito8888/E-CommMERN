// backend/routes/paymentRoutes.js

import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import { authenticate } from "../core/index.js";

// Configuration de Stripe
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Middleware de logging pour le développement
const logRequest = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Payment Route: ${req.method} ${req.path}`);
    if (req.body) console.log("Request data:", req.body);
  }
  next();
};

router.use(logRequest);
router.use(authenticate); // Protection de toutes les routes de paiement

// Créer une session de paiement Stripe
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, shippingAddress, customerEmail } = req.body;

    // Validation des données d'entrée
    if (!cartItems?.length) {
      return res.status(400).json({
        message: "Le panier est vide"
      });
    }

    // Configuration de base de la session Stripe
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: [item.image],
            description: `Prix HT: ${item.priceHT}€ | TVA: ${item.taxAmount}€`
          },
          unit_amount: Math.round(item.price * 100), // Prix TTC en centimes
          tax_behavior: 'inclusive', // Prix TTC
        },
        quantity: item.qty,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      customer_email: customerEmail || req.user.email,
      metadata: {
        userId: req.user.id,
        shippingAddress: JSON.stringify(shippingAddress)
      }
    };

    // Création de la session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la session de paiement"
    });
  }
});

// Endpoint pour récupérer les détails d'une session et proposer la création de compte
router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['customer', 'shipping_details', 'custom_fields', 'line_items']
    });

    // Si l'utilisateur est déjà client Stripe (donc inscrit), ne pas proposer la création de compte
    if (session.customer) {
      return res.json({ 
        session,
        canCreateAccount: false
      });
    }

    // Préparer les données pour la création de compte
    const accountData = {
      email: session.customer_details.email,
      name: session.customer_details.name,
      phone: session.customer_details.phone,
      address: {
        street: session.shipping_details?.address?.line1,
        city: session.shipping_details?.address?.city,
        postalCode: session.shipping_details?.address?.postal_code,
        country: session.shipping_details?.address?.country || 'FR',
      },
      newsletter: session.custom_fields.find(f => f.key === 'newsletter_subscription')?.value || false,
      orderDetails: {
        orderId: session.id,
        amount: session.amount_total,
        items: session.line_items.data,
        date: new Date(session.created * 1000)
      }
    };

    res.json({
      session,
      canCreateAccount: true,
      accountData
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la session",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Endpoint pour créer un compte utilisateur après le paiement
router.post("/create-account-after-payment", async (req, res) => {
  try {
    const { 
      sessionId, 
      password,
      newsletter,
      acceptTerms 
    } = req.body;

    if (!password || !acceptTerms) {
      return res.status(400).json({ 
        message: "Informations manquantes pour la création du compte" 
      });
    }

    // Récupérer les détails de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'shipping_details', 'custom_fields']
    });

    // Vérifier que l'utilisateur n'a pas déjà un compte
    const User = require('../models/userModel');
    const existingUser = await User.findOne({ email: session.customer_details.email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Un compte existe déjà avec cette adresse email" 
      });
    }

    // Créer un client Stripe pour le nouvel utilisateur
    const customer = await stripe.customers.create({
      email: session.customer_details.email,
      name: session.customer_details.name,
      phone: session.customer_details.phone,
      shipping: {
        address: {
          line1: session.shipping_details?.address?.line1,
          city: session.shipping_details?.address?.city,
          postal_code: session.shipping_details?.address?.postal_code,
          country: session.shipping_details?.address?.country || 'FR',
        },
        name: session.customer_details.name,
      }
    });

    // Créer l'utilisateur dans la base de données
    const userData = {
      email: session.customer_details.email,
      name: session.customer_details.name,
      phone: session.customer_details.phone,
      password,
      address: {
        street: session.shipping_details?.address?.line1,
        city: session.shipping_details?.address?.city,
        postalCode: session.shipping_details?.address?.postal_code,
        country: session.shipping_details?.address?.country || 'FR',
      },
      newsletter: newsletter || false,
      stripeCustomerId: customer.id,
      orderHistory: [session.id],
      acceptTerms: true
    };

    const newUser = new User(userData);
    await newUser.save();

    // Générer un token JWT pour l'authentification automatique
    const token = newUser.generateAuthToken();

    res.json({
      message: "Compte créé avec succès",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
      token
    });

  } catch (err) {
    console.error("Erreur lors de la création du compte:", err);
    res.status(500).json({
      message: "Erreur lors de la création du compte",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Webhook pour gérer les événements Stripe
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Enregistrer la commande dans la base de données
        // TODO: Implémenter la logique de sauvegarde de commande
        console.log('Commande complétée:', session.id);
        
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        console.error('Échec du paiement:', paymentIntent.id);
        break;

      default:
        console.log(`Event non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Erreur webhook:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export { stripe }; // Exporter l'instance Stripe pour une utilisation dans d'autres fichiers
export default router;
