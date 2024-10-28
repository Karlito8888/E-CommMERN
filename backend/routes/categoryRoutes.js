import express from "express";
const router = express.Router();
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} from "../controllers/categoryController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Routes pour la gestion des catégories
router
  .route("/")
  // Créer une catégorie (admin uniquement)
  .post(authenticate, authorizeAdmin, createCategory);

// Liste de toutes les catégories
router.route("/categories").get(listCategory);

// Gestion d'une catégorie spécifique par son ID
router
  .route("/:id")
  // Lire une catégorie spécifique
  .get(readCategory)
  // Mettre à jour une catégorie (admin uniquement)
  .put(authenticate, authorizeAdmin, updateCategory)
  // Supprimer une catégorie (admin uniquement)
  .delete(authenticate, authorizeAdmin, removeCategory);

export default router;
