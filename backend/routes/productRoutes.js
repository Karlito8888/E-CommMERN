// backend/routes/productRoutes.js

import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configuration de multer avec validation des types de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Controllers
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  updateProductStock,
  getTopProducts,
  getAllBrands
} from "../controllers/productController.js";

// Middlewares
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";
import { 
  productValidationRules, 
  validateRequest,
  validateQueryParams,
  stockValidationRules 
} from "../middlewares/validationMiddleware.js";
import { cacheMiddleware, invalidateCache } from "../utils/cache.js";
import { APIError } from '../middlewares/errorMiddleware.js';

// Middleware de gestion d'erreur pour multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      throw new APIError('La taille du fichier ne doit pas dépasser 5MB', 400);
    }
    throw new APIError('Erreur lors du téléchargement du fichier', 400);
  } else if (err) {
    throw new APIError(err.message, 400);
  }
  next();
};

// Middleware pour invalider le cache après les modifications
const invalidateProductCache = async (req, res, next) => {
  try {
    const cacheKeys = ['products', 'product-list'];
    
    // Invalider les caches spécifiques
    for (const key of cacheKeys) {
      invalidateCache(key);
    }
    
    // Invalider le cache du produit spécifique si un ID est fourni
    if (req.params.id) {
      invalidateCache(`product:${req.params.id}`);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Routes publiques
router.get("/", 
  validateQueryParams(['keyword', 'category', 'minPrice', 'maxPrice', 'sortBy', 'order', 'page', 'limit']),
  validateRequest,
  cacheMiddleware('products', 300), 
  fetchProducts
);

router.get("/top", cacheMiddleware('top-products', 300), getTopProducts);

router.get("/brands", cacheMiddleware('brands', 3600), getAllBrands);

router.get("/filtered",
  validateQueryParams(['checked', 'radio', 'page', 'limit']),
  validateRequest,
  cacheMiddleware('filtered-products', 300),
  fetchProducts
);

router.get("/:id",
  checkId,
  cacheMiddleware('product:${params.id}', 600),
  fetchProductById
);

// Routes protégées
router.use(authenticate);

// Routes administrateur
router.use(authorizeAdmin);

router.post("/",
  upload.single("image"),
  handleMulterError,
  productValidationRules(),
  validateRequest,
  invalidateProductCache,
  addProduct
);

router.put("/:id",
  checkId,
  upload.single("image"),
  handleMulterError,
  productValidationRules(),
  validateRequest,
  invalidateProductCache,
  updateProductDetails
);

router.patch("/:id/stock",
  checkId,
  stockValidationRules(),
  validateRequest,
  invalidateProductCache,
  updateProductStock
);

router.delete("/:id",
  checkId,
  invalidateProductCache,
  removeProduct
);

export default router;
