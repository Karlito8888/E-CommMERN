// backend/routes/paymentRoutes.js

import express from "express";
import stripe from "../config/stripeConfig.js";
import logger from '../utils/logger.js';
import { 
  handleStripeError, 
  validateCartItems, 
  generateIdempotencyKey,
  updateProductStock 
} from '../utils/stripeUtils.js';

const router = express.Router();

logger.info("Payment routes initialized");

router.post("/create-checkout-session", async (req, res) => {
  logger.info("Creating checkout session", { 
    customerEmail: req.body.customerEmail,
    itemCount: req.body.cartItems?.length 
  });

  try {
    const { cartItems, totalPrice, shippingAddress, customerEmail } = req.body;

    // Valider les articles du panier
    await validateCartItems(cartItems);

    const idempotencyKey = generateIdempotencyKey();
    
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
      payment_method_options: {
        card: {
          request_three_d_secure: 'any', // Force 3D Secure quand disponible
        },
      },
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      customer_email: customerEmail,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/placeorder`,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
        totalPrice: totalPrice,
        cartItems: JSON.stringify(cartItems)
      },
    }, {
      idempotencyKey
    });

    logger.info("Checkout session created", { 
      sessionId: session.id,
      totalPrice 
    });

    res.json({ sessionUrl: session.url });
  } catch (err) {
    const { status, message } = handleStripeError(err);
    res.status(status).json({ message });
  }
});

// Route pour le webhook Stripe
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    logger.info('Webhook received', { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Vérifier si les métadonnées du panier existent
        if (session.metadata && session.metadata.cartItems) {
          // Mettre à jour le stock
          const cartItems = JSON.parse(session.metadata.cartItems);
          await updateProductStock(cartItems);
          
          logger.info('Payment successful and stock updated', { 
            sessionId: session.id,
            customer: session.customer_email 
          });
        } else {
          logger.info('Payment successful (test event - no cart items)', { 
            sessionId: session.id,
            customer: session.customer_email 
          });
        }
        break;

      case 'charge.failed':
        const failedCharge = event.data.object;
        const errorDetails = {
          chargeId: failedCharge.id,
          amount: (failedCharge.amount / 100).toFixed(2),
          currency: failedCharge.currency.toUpperCase(),
          failureCode: failedCharge.failure_code,
          failureMessage: getLocalizedErrorMessage(failedCharge.failure_code, failedCharge.failure_message),
          outcome: failedCharge.outcome
        };

        logger.warn('Charge failed', errorDetails);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
        const failureCode = paymentIntent.last_payment_error?.code || 'unknown';
        
        const paymentErrorDetails = {
          intentId: paymentIntent.id,
          customerId: paymentIntent.customer,
          amount: (paymentIntent.amount / 100).toFixed(2),
          currency: paymentIntent.currency.toUpperCase(),
          errorCode: failureCode,
          errorMessage: getLocalizedErrorMessage(failureCode, failureMessage),
          requires3DS: paymentIntent.status === 'requires_action',
          last_payment_error: paymentIntent.last_payment_error,
          authentication_status: paymentIntent.last_payment_error?.payment_method?.card?.three_d_secure_usage
        };

        logger.warn('Payment failed', paymentErrorDetails);

        // Si nous avons des métadonnées de produits, on pourrait les libérer ici
        if (paymentIntent.metadata && paymentIntent.metadata.cartItems) {
          logger.info('Releasing held inventory', {
            intentId: paymentIntent.id
          });
          // Logique pour libérer l'inventaire réservé si nécessaire
        }
        break;
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook error', { error: err.message });
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Fonction utilitaire pour obtenir des messages d'erreur localisés
function getLocalizedErrorMessage(code, defaultMessage) {
  const errorMessages = {
    'card_declined': 'Votre carte a été refusée. Veuillez vérifier vos informations ou utiliser une autre carte.',
    'insufficient_funds': 'Fonds insuffisants sur la carte. Veuillez utiliser une autre carte.',
    'expired_card': 'Cette carte est expirée. Veuillez utiliser une autre carte.',
    'incorrect_cvc': 'Le code CVC est incorrect. Veuillez vérifier et réessayer.',
    'processing_error': 'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.',
    'lost_card': 'Cette carte a été signalée comme perdue. Veuillez utiliser une autre carte.',
    'stolen_card': 'Cette carte a été signalée comme volée. Veuillez utiliser une autre carte.',
    'authentication_required': 'Une authentification 3D Secure est requise. Veuillez suivre les instructions de votre banque.',
    'authentication_failed': 'L\'authentification 3D Secure a échoué. Veuillez réessayer ou contacter votre banque.',
    'three_d_secure_redirect': 'Redirection vers l\'authentification 3D Secure...',
    'default': 'Une erreur est survenue lors du paiement. Veuillez réessayer ou contacter le support.'
  };

  // Gestion spécifique des erreurs 3D Secure
  if (code?.includes('3ds')) {
    return errorMessages['authentication_required'];
  }

  return errorMessages[code] || errorMessages['default'] || defaultMessage;
}

// Route pour récupérer la session
router.get("/session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logger.info('Session retrieved', { sessionId });
    res.json(session);
  } catch (err) {
    const { status, message } = handleStripeError(err);
    logger.error('Session retrieval error', { 
      sessionId,
      error: err.message 
    });
    res.status(status).json({ message });
  }
});

export default router;
