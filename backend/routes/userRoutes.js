// backend/routes/userRoutes.js

import express from 'express';
import * as userController from '../controllers/userController.js';
import * as passwordController from '../controllers/passwordController.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';
import { validateRequest, mongoIdValidation } from '../middlewares/validationMiddleware.js';
import { userValidationRules } from '../middlewares/userValidation.js';

const router = express.Router();

// Middleware pour les routes authentifiées
const authenticatedRoute = [authenticate];
const adminRoute = [...authenticatedRoute, authorizeAdmin];

// Routes publiques
router.post('/register', userValidationRules.register, validateRequest, userController.createUser);
router.post('/login', userValidationRules.login, validateRequest, userController.loginUser);
router.post('/password/reset-request', userValidationRules.email, validateRequest, passwordController.requestPasswordReset);
router.post('/password/reset/:token', userValidationRules.resetPassword, validateRequest, passwordController.resetPassword);

// Routes authentifiées
router.use(authenticate);

router.route('/profile')
  .get(userController.getCurrentUserProfile)
  .put(userValidationRules.updateProfile, validateRequest, userController.updateCurrentUserProfile);

router.put('/profile/shipping', 
  userValidationRules.shippingAddress, 
  validateRequest, 
  userController.updateShippingAddress
);

router.put('/password/change',
  userValidationRules.changePassword,
  validateRequest,
  passwordController.changeUserPassword
);

router.post('/logout', userController.logoutCurrentUser);

// Routes admin
router.use(authorizeAdmin);

router.route('/')
  .get(userController.getAllUsers)
  .post(userValidationRules.register, validateRequest, userController.createUser);

router.route('/:id')
  .get(mongoIdValidation, userController.getUserById)
  .put(mongoIdValidation, userValidationRules.updateUser, validateRequest, userController.updateUserById)
  .delete(mongoIdValidation, userController.deleteUserById);

export default router;
