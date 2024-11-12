// backend/services/stripeService.js

import stripe from "../config/stripeConfig.js"; // Utilisation de la configuration Stripe

// Fonction pour créer une session de paiement Stripe
const createCheckoutSession = async (items) => {
  try {
    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "eur", // Utilisation de l'euro
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe travaille en centimes
        },
        quantity: item.quantity,
      })),
      mode: "payment", // Mode de paiement
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`, // URL en cas d'annulation
    });

    return session;
  } catch (error) {
    throw new Error(`Error creating checkout session: ${error.message}`);
  }
};

export { createCheckoutSession };


