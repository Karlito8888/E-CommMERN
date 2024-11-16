// backend/services/validationService.js

import { APIError } from '../middlewares/errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

class ValidationService {
  static async validateProduct(data) {
    const errors = [];

    // Validation du nom
    if (!data.name) {
      errors.push(ERROR_MESSAGES.PRODUCT.NAME.REQUIRED);
    } else if (data.name.trim().length < 2) {
      errors.push(ERROR_MESSAGES.PRODUCT.NAME.TOO_SHORT);
    } else if (data.name.trim().length > 100) {
      errors.push(ERROR_MESSAGES.PRODUCT.NAME.TOO_LONG);
    }

    // Validation du prix
    if (data.price === undefined) {
      errors.push(ERROR_MESSAGES.PRODUCT.PRICE.REQUIRED);
    } else if (data.price < 0 || isNaN(data.price)) {
      errors.push(ERROR_MESSAGES.PRODUCT.PRICE.INVALID);
    }

    // Validation de la description
    if (!data.description) {
      errors.push(ERROR_MESSAGES.PRODUCT.DESCRIPTION.REQUIRED);
    } else {
      const descLength = data.description.trim().length;
      if (descLength < 10) {
        errors.push(ERROR_MESSAGES.PRODUCT.DESCRIPTION.TOO_SHORT);
      } else if (descLength > 1000) {
        errors.push(ERROR_MESSAGES.PRODUCT.DESCRIPTION.TOO_LONG);
      }
    }

    // Validation de la catégorie
    if (!data.category) {
      errors.push(ERROR_MESSAGES.PRODUCT.CATEGORY.REQUIRED);
    }

    // Validation du stock et de la quantité
    if (data.stock !== undefined && (data.stock < 0 || isNaN(data.stock))) {
      errors.push(ERROR_MESSAGES.PRODUCT.STOCK.INVALID);
    }

    if (data.quantity !== undefined) {
      const futureStock = (data.stock || 0) + data.quantity;
      if (futureStock < 0) {
        errors.push(ERROR_MESSAGES.PRODUCT.STOCK.INSUFFICIENT);
      }
    }

    if (errors.length > 0) {
      throw new APIError(ERROR_MESSAGES.VALIDATION.INVALID_DATA, 400, errors);
    }
  }

  static validatePagination(page, limit) {
    const errors = [];
    const maxLimit = 100;

    // Validation de la page
    if (page && (isNaN(page) || page < 1)) {
      errors.push(ERROR_MESSAGES.PAGINATION.PAGE_NUMBER);
    }

    // Validation de la limite
    if (limit) {
      if (isNaN(limit) || limit < 1) {
        errors.push(ERROR_MESSAGES.PAGINATION.LIMIT_NUMBER);
      } else if (limit > maxLimit) {
        errors.push(ERROR_MESSAGES.PAGINATION.MAX_LIMIT);
      }
    }

    if (errors.length > 0) {
      throw new APIError(ERROR_MESSAGES.VALIDATION.INVALID_DATA, 400, errors);
    }

    return {
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 10, maxLimit)
    };
  }

  static validateSearchParams(params) {
    const errors = [];

    // Validation des prix
    if (params.minPrice !== undefined) {
      if (isNaN(params.minPrice)) {
        errors.push(ERROR_MESSAGES.PRODUCT.PRICE.MIN_PRICE);
      }
    }

    if (params.maxPrice !== undefined) {
      if (isNaN(params.maxPrice)) {
        errors.push(ERROR_MESSAGES.PRODUCT.PRICE.MAX_PRICE);
      }
    }

    if (params.minPrice && params.maxPrice) {
      const min = Number(params.minPrice);
      const max = Number(params.maxPrice);
      if (min > max) {
        errors.push(ERROR_MESSAGES.PRODUCT.PRICE.RANGE_ERROR);
      }
    }

    if (errors.length > 0) {
      throw new APIError(ERROR_MESSAGES.VALIDATION.INVALID_DATA, 400, errors);
    }
  }
}

export { ValidationService };
