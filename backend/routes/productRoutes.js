// backend/routes/productRoutes.js
import express from 'express';
import { 
  getProducts,
  getProductById,
  getTopRatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../core/index.js';
import { upload, processImage } from './uploadRoutes.js';

const router = express.Router();

// Routes publiques
router
  .route('/')
  .get(getProducts);

router
  .route('/top')
  .get(getTopRatedProducts);

router
  .route('/:id')
  .get(getProductById);

// Routes protégées Admin
router.use(authenticate, authorizeAdmin);

router
  .route('/')
  .post(upload.single('image'), processImage, createProduct);

router
  .route('/:id')
  .put(upload.single('image'), processImage, updateProduct)
  .delete(deleteProduct);

export default router;
