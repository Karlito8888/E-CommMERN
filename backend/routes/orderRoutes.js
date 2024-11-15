// backend/routes/orderRoutes.js

import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  getOrderStats
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Routes pour la création et la récupération des commandes
router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

// Route pour récupérer les commandes d'un utilisateur
router.route("/mine").get(authenticate, getUserOrders);

// Route pour les statistiques des commandes (admin uniquement)
router.route("/stats").get(authenticate, authorizeAdmin, getOrderStats);

// Routes pour une commande spécifique
router
  .route("/:id")
  .get(authenticate, findOrderById)
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

// Route pour le paiement
router.route("/:id/pay").put(authenticate, markOrderAsPaid);

export default router;
