// backend/routes/orderRoutes.js

import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  getOrders
} from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../core/index.js';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.use(authenticate);

router.route('/')
  .post(createOrder)
  .get(authorizeAdmin, getOrders);

router.get('/myorders', getMyOrders);

router.route('/:id')
  .get(getOrderById)
  .put(authorizeAdmin, updateOrderStatus);

export default router;
