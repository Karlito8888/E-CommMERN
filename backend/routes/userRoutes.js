// backend/routes/userRoutes.js

import express from 'express';
import {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  updateShippingAddress,
  changeUserPassword,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/password/reset/request', requestPasswordReset);
router.post('/password/reset', resetPassword);

// Routes authentifiées
router.use(authenticate);
router.post('/logout', logoutCurrentUser);
router.get('/profile', getCurrentUserProfile);
router.put('/profile', updateCurrentUserProfile);
router.put('/shipping-address', updateShippingAddress);
router.post('/password/change', changeUserPassword);

// Routes admin
router.use(authorizeAdmin);
router.get('/', getAllUsers);
router.route('/:id')
  .get(getUserById)
  .put(updateUserById)
  .delete(deleteUserById);

export default router;
