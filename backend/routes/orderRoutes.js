// backend/routes/orderRoutes.js

import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Routes pour la création et la récupération de toutes les commandes (admin uniquement)
router
  .route("/")
  .post(authenticate, createOrder) // Créer une nouvelle commande
  .get(authenticate, authorizeAdmin, getAllOrders); // Récupérer toutes les commandes (admin)

// Route pour récupérer les commandes d'un utilisateur spécifique
router.route("/mine").get(authenticate, getUserOrders);

// Routes pour les statistiques des commandes (admin uniquement)
router
  .route("/orders/count")
  .get(authenticate, authorizeAdmin, countTotalOrders); // Nombre total de commandes
router
  .route("/sales/total")
  .get(authenticate, authorizeAdmin, calculateTotalSales); // Total des ventes
router
  .route("/sales/by-date")
  .get(authenticate, authorizeAdmin, calculateTotalSalesByDate); // Total des ventes par date

// Route pour récupérer une commande spécifique par ID
router.route("/:id").get(authenticate, findOrderById);

// Route pour marquer une commande comme payée
router.route("/:id/pay").put(authenticate, markOrderAsPaid);

// Route pour marquer une commande comme livrée (admin uniquement)
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;

