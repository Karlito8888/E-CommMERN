// backend/controllers/userController.js

import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";
import isValidPassword from "../utils/validatePassword.js";

// Fonction utilitaire pour formater la réponse de l'utilisateur
const formatUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  shippingAddress: user.shippingAddress,
  isAdmin: user.isAdmin,
});

// Vérifier si l'utilisateur existe
const findUserById = async (id) => {
  return await User.findById(id);
};

// Créer un nouvel utilisateur
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Vérification des champs requis
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Tous les champs sont requis." });
  }

  // Vérification de l'existence de l'utilisateur
  const userExists = await User.findOne({ email });
  if (userExists)
    return res
      .status(400)
      .json({ success: false, message: "Utilisateur déjà existant." });

  // Validation du mot de passe
  const { isValid, message } = isValidPassword(password);
  if (!isValid) return res.status(400).json({ success: false, message });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  await newUser.save();
  generateToken(res, newUser._id);

  res.status(201).json({ success: true, user: formatUserResponse(newUser) });
});

// Connexion d'un utilisateur
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (
    !existingUser ||
    !(await bcrypt.compare(password, existingUser.password))
  ) {
    return res
      .status(401)
      .json({ success: false, message: "Email ou mot de passe invalide." });
  }

  generateToken(res, existingUser._id);
  res
    .status(200)
    .json({ success: true, user: formatUserResponse(existingUser) });
});

// Déconnexion de l'utilisateur
const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(204).send(); // 204 No Content
});

// Obtenir tous les utilisateurs
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password");
  res.json({ success: true, users: users.map(formatUserResponse) }); // Utilisation de la fonction utilitaire
});

// Obtenir le profil de l'utilisateur actuel
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });
  res.json({ success: true, user: formatUserResponse(user) });
});

// Mettre à jour le profil de l'utilisateur actuel
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });

  // Vérifiez le mot de passe actuel pour autoriser la mise à jour
  if (
    !req.body.password ||
    !(await bcrypt.compare(req.body.password, user.password))
  ) {
    return res
      .status(401)
      .json({ success: false, message: "Mot de passe actuel incorrect." });
  }

  // Mettez à jour les informations de l'utilisateur
  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  const updatedUser = await user.save();
  res.json({ success: true, user: formatUserResponse(updatedUser) });
});

// Mettre à jour l'adresse de livraison de l'utilisateur actuel
const updateShippingAddress = asyncHandler(async (req, res) => {
  const { address, city, postalCode, country } = req.body;

  // Vérifiez si l'utilisateur est connecté
  const user = await findUserById(req.user._id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });

  // Mettez à jour l'adresse de livraison
  user.shippingAddress = {
    address: address || user.shippingAddress.address,
    city: city || user.shippingAddress.city,
    postalCode: postalCode || user.shippingAddress.postalCode,
    country: country || user.shippingAddress.country,
  };

  const updatedUser = await user.save();
  res.json({
    success: true,
    message: "Adresse de livraison mise à jour avec succès.",
    user: formatUserResponse(updatedUser),
  });
});

// Supprimer un utilisateur par ID
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });

  if (user.isAdmin)
    return res
      .status(400)
      .json({
        success: false,
        message: "Impossible de supprimer un utilisateur admin.",
      });

  await User.deleteOne({ _id: user._id });
  res.json({ success: true, message: "Utilisateur supprimé." });
});

// Obtenir un utilisateur par ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });
  res.json({ success: true, user: formatUserResponse(user) });
});

// Mettre à jour un utilisateur par ID
const updateUserById = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    const { isValid, message } = isValidPassword(req.body.password);
    if (!isValid) return res.status(400).json({ success: false, message });
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await user.save();
  res.json({ success: true, user: formatUserResponse(updatedUser) });
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateShippingAddress,
  deleteUserById,
  getUserById,
  updateUserById,
};

