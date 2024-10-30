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
} from '../controllers/userController.js';
import {
  changeUserPassword,
  requestPasswordReset,
  resetPassword,
} from '../controllers/passwordController.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes d'authentification
router.post('/register', createUser); // Créer un nouvel utilisateur
router.post('/login', loginUser); // Connexion d'un utilisateur
router.post('/logout', authenticate, logoutCurrentUser); // Déconnexion d'un utilisateur

// Routes de gestion des utilisateurs
router.get('/', authenticate, authorizeAdmin, getAllUsers); // Obtenir tous les utilisateurs
router.get('/profile', authenticate, getCurrentUserProfile); // Obtenir le profil de l'utilisateur actuel
router.put('/profile', authenticate, updateCurrentUserProfile); // Mettre à jour le profil de l'utilisateur actuel
router.delete('/:id', authenticate, authorizeAdmin, deleteUserById); // Supprimer un utilisateur par ID
router.get('/:id', authenticate, authorizeAdmin, getUserById); // Obtenir un utilisateur par ID
router.put('/:id', authenticate, authorizeAdmin, updateUserById); // Mettre à jour un utilisateur par ID

// Routes de gestion des mots de passe
router.post('/password/change', authenticate, changeUserPassword); // Changer le mot de passe
router.post('/password/reset/request', requestPasswordReset); // Demander une réinitialisation de mot de passe
router.post('/password/reset', resetPassword); // Réinitialiser le mot de passe

export default router;
