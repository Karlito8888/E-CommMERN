// backend/routes/categoryRoutes.js

import express from "express";
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} from "../controllers/categoryController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Création d'une catégorie - admin uniquement
router.post("/", authenticate, authorizeAdmin, createCategory);

// Mise à jour d'une catégorie par ID - admin uniquement
router.put("/:categoryId", authenticate, authorizeAdmin, updateCategory);

// Suppression d'une catégorie par ID - admin uniquement
router.delete("/:categoryId", authenticate, authorizeAdmin, removeCategory);

// Liste de toutes les catégories - accessible à tous
router.get("/", listCategory);

// Lecture d'une catégorie spécifique par ID - accessible à tous
router.get("/:id", readCategory);

export default router;
