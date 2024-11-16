// backend/routes/productRoutes.js

import express from 'express';
import { 
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../core/index.js';
import { upload, processImage } from './uploadRoutes.js';

const router = express.Router();

// Routes publiques
router.get('/', getProducts);
router.get('/:id', getProductById);

// Routes protégées Admin
router.use(authenticate, authorizeAdmin);

router.post('/', upload.single('image'), processImage, createProduct);

router.route('/:id')
  .put(upload.single('image'), processImage, updateProduct)
  .delete(deleteProduct);

export default router;
