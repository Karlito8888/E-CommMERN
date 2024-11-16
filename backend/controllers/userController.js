// backend/controllers/userController.js

import User from "../models/userModel.js";
import { 
  asyncHandler, 
  validateFields,
  generateToken,
  validatePassword,
  sendEmail,
  hashPassword,
  cache,
  createTransporter
} from "../core/index.js";
import crypto from 'crypto';

// Constants
const CACHE_TTL = 300; // 5 minutes
const PASSWORD_RESET_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Format de réponse standard pour les utilisateurs
const formatUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  isAdmin: user.isAdmin,
  shippingAddress: user.shippingAddress || null,
  createdAt: user.createdAt
});

// Vérifier l'existence d'un utilisateur
const checkUserExists = async (email, username, excludeUserId = null) => {
  const query = {
    $and: [
      excludeUserId ? { _id: { $ne: excludeUserId } } : {},
      {
        $or: [
          email ? { email: { $regex: new RegExp(`^${email}$`, 'i') } } : { _id: null },
          username ? { username: { $regex: new RegExp(`^${username}$`, 'i') } } : { _id: null }
        ]
      }
    ]
  };

  const existingUser = await User.findOne(query).lean();
  if (!existingUser) return null;

  return existingUser.email === email 
    ? "Cet email est déjà utilisé" 
    : "Ce nom d'utilisateur est déjà utilisé";
};

// Créer un nouvel utilisateur
const createUser = asyncHandler(async (req, res) => {
  const { isValid, message } = validateFields(req.body, ['username', 'email', 'password']);
  if (!isValid) return res.status(400).json({ message });

  const { username, email, password } = req.body;

  const existsMessage = await checkUserExists(email, username);
  if (existsMessage) return res.status(400).json({ message: existsMessage });

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  const newUser = await User.create({
    username,
    email: email.toLowerCase(),
    password: await hashPassword(password)
  });

  generateToken(res, newUser._id);
  res.status(201).json(formatUserResponse(newUser));
});

// Connexion utilisateur
const loginUser = asyncHandler(async (req, res) => {
  const { isValid, message } = validateFields(req.body, ['email', 'password']);
  if (!isValid) return res.status(400).json({ message });

  const { email, password } = req.body;

  const user = await User.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Email ou mot de passe invalide" });
  }

  generateToken(res, user._id);
  res.json(formatUserResponse(user));
});

// Déconnexion utilisateur
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: "Déconnexion réussie" });
});

// Obtenir le profil utilisateur
const getUserProfile = asyncHandler(async (req, res) => {
  const cacheKey = `user_profile_${req.user._id}`;
  const cachedUser = await cache.get(cacheKey);
  
  if (cachedUser) {
    return res.json(cachedUser);
  }

  const user = await User.findById(req.user._id).lean();
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  const formattedUser = formatUserResponse(user);
  await cache.set(cacheKey, formattedUser, CACHE_TTL);
  res.json(formattedUser);
});

// Mettre à jour le profil utilisateur
const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email, shippingAddress } = req.body;
  
  const existsMessage = await checkUserExists(email, username, req.user._id);
  if (existsMessage) return res.status(400).json({ message: existsMessage });

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  if (username) user.username = username;
  if (email) user.email = email.toLowerCase();
  if (shippingAddress) user.shippingAddress = shippingAddress;

  const updatedUser = await user.save();
  await cache.del(`user_profile_${req.user._id}`);
  res.json(formatUserResponse(updatedUser));
});

// Changer le mot de passe
const changeUserPassword = asyncHandler(async (req, res) => {
  const { isValid, message } = validateFields(req.body, ['currentPassword', 'newPassword']);
  if (!isValid) return res.status(400).json({ message });

  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: "Mot de passe actuel invalide" });
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  res.json({ message: "Mot de passe modifié avec succès" });
});

// Admin: Obtenir tous les utilisateurs avec pagination
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const cacheKey = `users_list_${page}_${limit}`;
  const cachedUsers = await cache.get(cacheKey);
  
  if (cachedUsers) {
    return res.json(cachedUsers);
  }

  const [users, total] = await Promise.all([
    User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments()
  ]);

  const result = {
    users: users.map(formatUserResponse),
    page,
    pages: Math.ceil(total / limit),
    total
  };

  await cache.set(cacheKey, result, CACHE_TTL);
  res.json(result);
});

// Admin: Obtenir un utilisateur par ID
const getUserById = asyncHandler(async (req, res) => {
  const cacheKey = `user_${req.params.id}`;
  const cachedUser = await cache.get(cacheKey);
  
  if (cachedUser) {
    return res.json(cachedUser);
  }

  const user = await User.findById(req.params.id).lean();
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

  const formattedUser = formatUserResponse(user);
  await cache.set(cacheKey, formattedUser, CACHE_TTL);
  res.json(formattedUser);
});

// Admin: Mettre à jour un utilisateur
const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

  const { username, email, isAdmin } = req.body;
  
  const existsMessage = await checkUserExists(email, username, req.params.id);
  if (existsMessage) return res.status(400).json({ message: existsMessage });

  user.username = username || user.username;
  user.email = email ? email.toLowerCase() : user.email;
  user.isAdmin = isAdmin ?? user.isAdmin;

  const updatedUser = await user.save();
  await Promise.all([
    cache.del(`user_${req.params.id}`),
    cache.del(`user_profile_${req.params.id}`),
    cache.del(/^users_list_/)
  ]);
  
  res.json(formatUserResponse(updatedUser));
});

// Admin: Supprimer un utilisateur
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  if (user.isAdmin) {
    return res.status(400).json({ message: "Impossible de supprimer un admin" });
  }

  await user.deleteOne();
  await Promise.all([
    cache.del(`user_${req.params.id}`),
    cache.del(`user_profile_${req.params.id}`),
    cache.del(/^users_list_/)
  ]);
  
  res.json({ message: "Utilisateur supprimé" });
});

// Mettre à jour l'adresse de livraison
const updateShippingAddress = asyncHandler(async (req, res) => {
  const { isValid, message } = validateFields(req.body, ['address', 'city', 'postalCode', 'country']);
  if (!isValid) return res.status(400).json({ message });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

  user.shippingAddress = req.body;
  const updatedUser = await user.save();
  
  await cache.del(`user_profile_${req.user._id}`);
  res.json(formatUserResponse(updatedUser));
});

// Demander une réinitialisation de mot de passe
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requis" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Réponse délibérément vague pour la sécurité
    return res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation sera envoyé" });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpires = Date.now() + PASSWORD_RESET_EXPIRY;
  await user.save();

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de mot de passe",
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    });

    res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation sera envoyé" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
});

// Réinitialiser le mot de passe
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
  }
  
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalide ou expiré" });
  }

  const { isValid, message } = validatePassword(password);
  if (!isValid) return res.status(400).json({ message });

  user.password = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Mot de passe réinitialisé avec succès" });
});

export {
  createUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updateShippingAddress,
  requestPasswordReset,
  resetPassword,
};
