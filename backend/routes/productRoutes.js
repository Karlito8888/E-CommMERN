import express from "express";
import formidable from "express-formidable";
const router = express.Router();

// Import des contrôleurs
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
} from "../controllers/productController.js";

// Import des middlewares
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

// Routes pour la gestion des produits

// Récupérer tous les produits (pagination possible) et ajouter un nouveau produit (admin uniquement)
router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

// Récupérer tous les produits sans pagination
router.route("/all").get(fetchAllProducts);

// Récupérer les meilleurs produits
router.get("/top", fetchTopProducts);

// Récupérer les nouveaux produits
router.get("/new", fetchNewProducts);

// Ajouter un avis sur un produit spécifique
router.route("/:id/reviews").post(authenticate, checkId, addProductReview);

// Récupérer, mettre à jour ou supprimer un produit spécifique (admin pour les PUT et DELETE)
router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);

// Filtrer les produits selon des critères spécifiques
router.route("/filtered-products").post(filterProducts);

export default router;
