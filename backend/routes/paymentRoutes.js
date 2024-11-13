// backend/routes/paymentRoutes.js

import express from "express";
import stripe from "../config/stripeConfig.js";

const router = express.Router();

console.log("paymentRoutes loaded"); // Ajoutez ceci pour vérifier le chargement

router.post("/create-checkout-session", async (req, res) => {
  console.log("Received request data:", req.body); // Log pour vérifier les données reçues
  try {
    
    const { cartItems, totalPrice, shippingAddress, customerEmail } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      customer_email: customerEmail,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/placeorder`,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
        totalPrice: totalPrice,
      },
    });
    console.log("Session URL: ", session.url);

    res.json({ sessionUrl: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({
      message: "Erreur lors de la création de la session Stripe.",
      details: err.message,
    });
  }
});

// Nouvelle route pour récupérer la session
router.get("/session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (err) {
    console.error("Erreur lors de la récupération de la session:", err);
    res.status(404).json({
      message: "Session non trouvée",
      details: err.message,
    });
  }
});

export default router;

