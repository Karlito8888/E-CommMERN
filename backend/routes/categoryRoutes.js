// backend/routes/categoryRoutes.js

import express from "express";
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategories,
  getCategoryById,
  getCategoryBySlug,
} from "../controllers/categoryController.js";
import { authenticate, authorizeAdmin, checkId } from "../core/index.js";

const router = express.Router();

// Routes publiques
router.get("/", listCategories);
router
  .route("/id/:categoryId")
  .get(checkId, getCategoryById);
router.get("/slug/:slug", getCategoryBySlug);

// Routes admin
router.use(authenticate, authorizeAdmin);
router
  .route("/")
  .post(createCategory);
router
  .route("/:categoryId")
  .put(checkId, updateCategory)
  .delete(checkId, removeCategory);

export default router;
