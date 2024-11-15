import { body, query, param, validationResult } from 'express-validator';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import { APIError } from './errorMiddleware.js';

// Fonction utilitaire pour valider les résultats
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new APIError(errorMessages[0], 400);
  }
  next();
};

// Validation des ID MongoDB
export const mongoIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} invalide`)
];

// Validation des paramètres de pagination
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
];

// Validation des paramètres de tri
export const sortValidation = (allowedFields) => [
  query('sortBy')
    .optional()
    .isIn(allowedFields)
    .withMessage(`Le tri n'est autorisé que sur: ${allowedFields.join(', ')}`),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre de tri invalide (asc/desc)')
];

// Validation des paramètres de requête
export const validateQueryParams = (allowedParams) => {
  return [
    ...allowedParams.map(param => 
      query(param)
        .optional()
        .trim()
        .escape()
    ),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le prix minimum doit être un nombre positif'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le prix maximum doit être un nombre positif')
      .custom((value, { req }) => {
        if (req.query.minPrice && Number(value) <= Number(req.query.minPrice)) {
          throw new Error('Le prix maximum doit être supérieur au prix minimum');
        }
        return true;
      }),
    ...paginationValidation,
    ...sortValidation(['name', 'price', 'createdAt', 'rating'])
  ];
};

// Règles de validation pour les utilisateurs
export const userValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('nom'))
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('email'))
    .isEmail()
    .withMessage(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL)
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('mot de passe'))
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial')
];

// Règles de validation pour les produits
export const productValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('nom'))
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

    body('description')
      .trim()
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('description'))
      .isLength({ min: 10, max: 1000 })
      .withMessage('La description doit contenir entre 10 et 1000 caractères'),

    body('price')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('prix'))
      .isFloat({ min: 0 })
      .withMessage('Le prix doit être un nombre positif'),

    body('category')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('catégorie'))
      .isMongoId()
      .withMessage('ID de catégorie invalide'),

    body('brand')
      .trim()
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('marque'))
      .isLength({ min: 2, max: 50 })
      .withMessage('La marque doit contenir entre 2 et 50 caractères'),

    body('quantity')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('quantité'))
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un nombre entier positif'),

    body('specifications')
      .optional()
      .isArray()
      .withMessage('Les spécifications doivent être un tableau'),

    body('specifications.*.key')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('La clé de spécification ne peut pas être vide')
      .isLength({ max: 50 })
      .withMessage('La clé de spécification ne doit pas dépasser 50 caractères'),

    body('specifications.*.value')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('La valeur de spécification ne peut pas être vide')
      .isLength({ max: 200 })
      .withMessage('La valeur de spécification ne doit pas dépasser 200 caractères'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('Les tags doivent être un tableau')
      .custom((value) => {
        if (value && value.length > 10) {
          throw new Error('Maximum 10 tags autorisés');
        }
        return true;
      }),

    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage('Chaque tag doit contenir entre 2 et 20 caractères')
      .matches(/^[a-zA-Z0-9À-ÿ\s-]+$/)
      .withMessage('Les tags ne peuvent contenir que des lettres, chiffres, espaces et tirets'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive doit être un booléen'),

    body('discountPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Le pourcentage de réduction doit être entre 0 et 100')
  ];
};

// Validation pour la mise à jour du stock
export const stockValidationRules = () => {
  return [
    body('quantity')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('quantité'))
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un nombre entier positif')
  ];
};

// Validation pour les catégories
export const categoryValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('nom'))
    .isLength({ min: 2, max: 32 })
    .withMessage('Le nom doit contenir entre 2 et 32 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, chiffres, espaces et tirets')
];
