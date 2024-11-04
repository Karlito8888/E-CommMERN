// backend/routes/productRoutes.js

import express from "express";
import multer from "multer";
const router = express.Router();

// Configuration de multer
const upload = multer({ dest: "uploads/" });

// Controllers
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
} from "../controllers/productController.js"; 

// Middlewares
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

// Routes publiques
router.get("/", fetchProducts); 
router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);
router.post("/filtered-products", filterProducts);
router.get("/:id", checkId, fetchProductById);

// Routes protégées par authentification
router.use(authenticate);

router.post("/:id/reviews", checkId, addProductReview);

// Routes administrateur protégées
router.use(authorizeAdmin);
router.post("/", upload.single("image"), addProduct);
router.put("/:id", checkId, upload.single("image"), updateProductDetails);
router.delete("/:id", checkId, removeProduct);

export default router;


