// backend/services/validationService.js

import { APIError } from '../middlewares/errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

class ValidationService {
  static async validateProduct(data) {
    const errors = [];

    // Validation du nom
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Le nom du produit doit contenir au moins 2 caractères');
    }

    // Validation du prix
    if (data.price === undefined || data.price < 0) {
      errors.push('Le prix doit être un nombre positif');
    }

    // Validation de la description
    if (!data.description || data.description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }

    // Validation de la catégorie
    if (!data.category) {
      errors.push('La catégorie est requise');
    }

    // Validation du stock et de la quantité
    if (data.stock !== undefined && data.stock < 0) {
      errors.push('Le stock ne peut pas être négatif');
    }

    if (data.quantity !== undefined) {
      const futureStock = (data.stock || 0) + data.quantity;
      if (futureStock < 0) {
        errors.push('La quantité à retirer ne peut pas rendre le stock négatif');
      }
    }

    if (errors.length > 0) {
      throw new APIError(errors.join(', '), 400);
    }
  }

  static validatePagination(page, limit) {
    const errors = [];

    if (page && (isNaN(page) || page < 1)) {
      errors.push('Le numéro de page doit être un nombre positif');
    }

    if (limit && (isNaN(limit) || limit < 1)) {
      errors.push('La limite doit être un nombre positif');
    }

    if (errors.length > 0) {
      throw new APIError(errors.join(', '), 400);
    }

    return {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };
  }

  static validateSearchParams(params) {
    const errors = [];

    if (params.minPrice && isNaN(params.minPrice)) {
      errors.push('Le prix minimum doit être un nombre');
    }

    if (params.maxPrice && isNaN(params.maxPrice)) {
      errors.push('Le prix maximum doit être un nombre');
    }

    if (params.minPrice && params.maxPrice && Number(params.minPrice) > Number(params.maxPrice)) {
      errors.push('Le prix minimum ne peut pas être supérieur au prix maximum');
    }

    if (errors.length > 0) {
      throw new APIError(errors.join(', '), 400);
    }
  }
}

export { ValidationService };
