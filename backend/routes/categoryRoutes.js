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
import { cacheMiddleware, invalidateCache } from "../utils/cache.js";
import { validateCategory } from "../validators/categoryValidator.js";

const router = express.Router();

// Middleware pour invalider le cache des catégories
const invalidateCategoryCache = async (req, res, next) => {
  try {
    await invalidateCache(['categories', 'products']); // Invalider aussi le cache des produits car ils peuvent dépendre des catégories
    if (req.params.id || req.params.categoryId) {
      const categoryId = req.params.id || req.params.categoryId;
      await invalidateCache([
        `category-detail:${categoryId}`,
        `category-products:${categoryId}`
      ]);
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Routes publiques
router.get("/", 
  cacheMiddleware('categories', 1800), 
  listCategory
);

router.get("/:id", 
  cacheMiddleware('category-detail', 1800), 
  readCategory
);

// Routes protégées (admin uniquement)
router.use(authenticate, authorizeAdmin);

router.post("/", 
  validateCategory,
  invalidateCategoryCache,
  createCategory
);

router.put("/:categoryId", 
  validateCategory,
  invalidateCategoryCache,
  updateCategory
);

router.delete("/:categoryId", 
  invalidateCategoryCache,
  removeCategory
);

export default router;
