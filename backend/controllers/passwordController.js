// backend/controllers/passwordController.js

import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import createTransporter from "../utils/transporter.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import isValidPassword from "../utils/validatePassword.js";

// Générer l'URL de réinitialisation
const generateResetUrl = (host, token) =>
  `http://${host}/reset-password/${token}`;

// Vérifier si l'utilisateur existe
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Changer le mot de passe de l'utilisateur actuel
const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res
      .status(401)
      .json({ success: false, message: "Mot de passe actuel incorrect." });
  }

  const { isValid, message } = isValidPassword(newPassword);
  if (!isValid) return res.status(400).json({ success: false, message });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: "Mot de passe changé avec succès." });
});

// Demander une réinitialisation de mot de passe
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await findUserByEmail(email);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Utilisateur non trouvé." });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
  await user.save();

  const transporter = createTransporter();
  const resetUrl = generateResetUrl(req.headers.host, resetToken);

  const mailOptions = {
    to: user.email,
    subject: "Demande de réinitialisation de mot de passe",
    html: `<p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p><a href="${resetUrl}">Réinitialiser le mot de passe</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email de réinitialisation envoyé." });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de l'envoi de l'email." });
  }
});

// Réinitialiser le mot de passe
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Token invalide ou expiré." });

  const { isValid, message } = isValidPassword(newPassword);
  if (!isValid) return res.status(400).json({ success: false, message });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = user.resetPasswordExpires = undefined;

  await user.save();
  res.json({ success: true, message: "Mot de passe réinitialisé." });
});

export { changeUserPassword, requestPasswordReset, resetPassword };

