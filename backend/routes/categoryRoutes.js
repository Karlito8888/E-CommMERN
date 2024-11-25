// backend/routes/categoryRoutes.js

import express from "express";
import {
  createCategory,
  updateCategory,
  getCategories,
  getCategoryById,
  deleteCategory
} from "../controllers/categoryController.js";
import { authenticate, authorizeAdmin, checkId } from "../core/index.js";

const router = express.Router();

// Routes publiques
router
  .route("/")
  .get(getCategories);

router
  .route("/:categoryId")
  .get(checkId, getCategoryById);

// Routes admin
router.use(authenticate, authorizeAdmin);

router
  .route("/")
  .post(createCategory);

router
  .route("/:categoryId")
  .put(checkId, updateCategory)
  .delete(checkId, deleteCategory);

export default router;
