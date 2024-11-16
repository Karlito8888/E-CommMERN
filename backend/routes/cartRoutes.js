// backend/routes/cartRoutes.js

import express from 'express';
import {
  getCart,
  syncCart,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../core/index.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

router.route('/')
  .get(getCart)
  .post(syncCart)
  .delete(clearCart);

export default router;
