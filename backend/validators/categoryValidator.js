// backend/validators/categoryValidator.js

import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validationMiddleware.js';

export const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom de la catégorie est requis')
    .isLength({ min: 2, max: 32 })
    .withMessage('Le nom doit contenir entre 2 et 32 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, chiffres, espaces et tirets'),
  validateRequest
];
