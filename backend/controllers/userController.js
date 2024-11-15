// backend/controllers/userController.js
import User from '../models/userModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import logger from '../utils/logger.js';
import { APIError } from '../middlewares/errorMiddleware.js';
import { formatUserResponse } from '../middlewares/responseMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

const logUserAction = (action, userId, email = null, adminId = null) => {
  const logData = { userId, action };
  if (email) logData.email = email;
  if (adminId) logData.adminId = adminId;
  logger.info(`User ${action}`, logData);
};

// @desc    Créer un nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  const token = user.getSignedJwtToken();
  
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  logUserAction('registered', user._id, req.body.email);
  
  res.status(201).json(formatUserResponse(user));
});

// @desc    Connecter un utilisateur
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  
  const token = user.getSignedJwtToken();
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  logUserAction('logged in', user._id, email);
  
  res.json(formatUserResponse(user));
});

// @desc    Déconnecter l'utilisateur
// @route   POST /api/users/logout
// @access  Private
export const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  logUserAction('logged out', req.user._id);
  
  res.status(204).send();
});

// @desc    Obtenir le profil utilisateur
// @route   GET /api/users/profile
// @access  Private
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(formatUserResponse(user));
});

// @desc    Mettre à jour le profil
// @route   PUT /api/users/profile
// @access  Private
export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier le mot de passe actuel
  const isPasswordValid = await user.matchPassword(req.body.currentPassword);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Mot de passe incorrect');
  }

  // Mise à jour des champs
  if (req.body.username) user.username = req.body.username;
  if (req.body.email) user.email = req.body.email;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin
  });
});

// @desc    Mettre à jour l'adresse de livraison
// @route   PUT /api/users/profile/shipping
// @access  Private
export const updateShippingAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true
  });
  logUserAction('updated shipping address', user._id);
  
  res.json(formatUserResponse(user));
});

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  logUserAction('retrieved all users', req.user._id);
  
  res.json(users.map(formatUserResponse));
});

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(formatUserResponse(user));
});

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Admin
export const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  logUserAction('updated by admin', user._id, null, req.user._id);
  res.json(formatUserResponse(user));
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUserById = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: ERROR_MESSAGES.USER.DELETED_SUCCESS });
});
