// backend/routes/paymentRoutes.js
import express from "express";
import { createCheckoutSession } from "../services/stripeService.js";

const router = express.Router();

// Route publique pour créer une session de paiement
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;
  try {
    // Appel au service Stripe pour créer la session de paiement
    const session = await createCheckoutSession(items);

    // Redirection vers la page de paiement Stripe
    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les détails de la session Stripe
router.get("/session/:session_id", async (req, res) => {
  const { session_id } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
