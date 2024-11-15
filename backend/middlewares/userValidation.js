// backend/middlewares/userValidation.js
import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

// Validations de base réutilisables
const baseValidations = {
  email: body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage(ERROR_MESSAGES.USER.EMAIL.INVALID),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage(ERROR_MESSAGES.USER.PASSWORD.TOO_SHORT)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage(ERROR_MESSAGES.USER.PASSWORD.INVALID),

  username: body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage(ERROR_MESSAGES.USER.USERNAME.TOO_SHORT),

  shippingAddress: [
    body('address').trim().notEmpty().withMessage(ERROR_MESSAGES.USER.SHIPPING.ADDRESS_REQUIRED),
    body('city').trim().notEmpty().withMessage(ERROR_MESSAGES.USER.SHIPPING.CITY_REQUIRED),
    body('postalCode')
      .trim()
      .matches(/^\d{5}$/)
      .withMessage(ERROR_MESSAGES.USER.SHIPPING.INVALID_POSTAL_CODE),
    body('country').trim().notEmpty().withMessage(ERROR_MESSAGES.USER.SHIPPING.COUNTRY_REQUIRED),
  ]
};

// Règles de validation pour différentes opérations
export const userValidationRules = {
  // Inscription
  register: [
    baseValidations.username,
    baseValidations.email,
    baseValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(ERROR_MESSAGES.USER.PASSWORD.NOT_MATCH);
        }
        return true;
      })
  ],

  // Connexion
  login: [
    baseValidations.email,
    body('password').notEmpty().withMessage(ERROR_MESSAGES.USER.PASSWORD.REQUIRED)
  ],

  // Mise à jour du profil
  updateProfile: [
    baseValidations.username.optional(),
    baseValidations.email.optional(),
    body('currentPassword')
      .notEmpty()
      .withMessage('Le mot de passe actuel est requis pour confirmer les modifications')
  ],

  // Changement de mot de passe
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.USER.PASSWORD.CURRENT_REQUIRED),
    baseValidations.password.custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error(ERROR_MESSAGES.USER.PASSWORD.SAME_AS_CURRENT);
      }
      return true;
    }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error(ERROR_MESSAGES.USER.PASSWORD.NOT_MATCH);
      }
      return true;
    })
  ],

  // Réinitialisation du mot de passe
  resetPassword: [
    baseValidations.password,
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(ERROR_MESSAGES.USER.PASSWORD.NOT_MATCH);
      }
      return true;
    })
  ],

  // Mise à jour de l'adresse de livraison
  shippingAddress: baseValidations.shippingAddress,

  // Email uniquement (pour la demande de réinitialisation)
  email: [baseValidations.email],

  // Mise à jour utilisateur (admin)
  updateUser: [
    baseValidations.username.optional(),
    baseValidations.email.optional(),
    body('isAdmin')
      .optional()
      .isBoolean()
      .withMessage(ERROR_MESSAGES.USER.INVALID_ADMIN_STATUS)
  ]
};
