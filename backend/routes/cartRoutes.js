// backend/routes/cartRoutes.js

import express from 'express';
import {
  getCart,
  syncCart,
  clearCart,
  validateGuestCart
} from '../controllers/cartController.js';
import { authenticate } from '../core/index.js';

const router = express.Router();

/**
 * Route publique pour valider le panier d'un utilisateur non connecté
 * POST /api/cart/guest/validate
 * @body {Array} items - Liste des articles du panier
 * @returns {Object} Panier validé avec totaux
 */
router.post('/guest/validate', validateGuestCart);

/**
 * Routes nécessitant une authentification
 * Toutes les routes ci-dessous nécessitent un token JWT valide
 */
router.use(authenticate);

/**
 * Routes du panier pour les utilisateurs connectés
 * GET    /api/cart          - Récupérer le panier
 * POST   /api/cart          - Synchroniser le panier
 * DELETE /api/cart          - Vider le panier
 */
router.route('/')
  .get(getCart)          // Récupérer le panier de l'utilisateur
  .post(syncCart)        // Synchroniser le panier avec le backend
  .delete(clearCart);    // Vider le panier

export default router;
