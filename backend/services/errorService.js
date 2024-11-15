// backend/services/errorService.js
import { logError } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

class ErrorService {
  static handleError(err, req = null) {
    // Préparer les données de log
    const logData = {
      error: {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      }
    };

    // Ajouter les informations de requête si disponibles
    if (req) {
      logData.request = {
        method: req.method,
        path: req.originalUrl || req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      // Ajouter l'ID utilisateur si disponible
      if (req.user) {
        logData.userId = req.user._id;
      }
    }

    // Logger l'erreur
    logError('Error occurred', logData);

    // Retourner la réponse d'erreur formatée
    return this.formatErrorResponse(err);
  }

  static formatErrorResponse(err) {
    // APIError personnalisée
    if (err.name === 'APIError') {
      return {
        status: err.statusCode,
        body: {
          success: false,
          message: err.message,
          details: err.details
        }
      };
    }

    // Erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }));
      return {
        status: 400,
        body: {
          success: false,
          message: ERROR_MESSAGES.VALIDATION.INVALID_DATA,
          details
        }
      };
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return {
        status: 401,
        body: {
          success: false,
          message: ERROR_MESSAGES.AUTH.TOKEN_INVALID
        }
      };
    }

    // Erreurs de session
    if (err.name === 'SessionError') {
      return {
        status: 401,
        body: {
          success: false,
          message: ERROR_MESSAGES.SESSION.INVALID
        }
      };
    }

    // Erreurs Stripe
    if (err.type && err.type.startsWith('Stripe')) {
      return this.handleStripeError(err);
    }

    // Erreurs de base de données MongoDB
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return this.handleMongoError(err);
    }

    // Erreur par défaut
    return {
      status: err.statusCode || 500,
      body: {
        success: false,
        message: process.env.NODE_ENV === 'production' 
          ? ERROR_MESSAGES.TECHNICAL.SERVER_ERROR 
          : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
      }
    };
  }

  static handleStripeError(error) {
    const errorMap = {
      'StripeCardError': {
        status: 400,
        message: ERROR_MESSAGES.PAYMENT.CARD_DECLINED
      },
      'StripeRateLimitError': {
        status: 429,
        message: ERROR_MESSAGES.TECHNICAL.RATE_LIMIT
      },
      'StripeInvalidRequestError': {
        status: 400,
        message: ERROR_MESSAGES.PAYMENT.INVALID_REQUEST
      },
      'StripeAPIError': {
        status: 500,
        message: ERROR_MESSAGES.PAYMENT.FAILED
      },
      'StripeConnectionError': {
        status: 503,
        message: ERROR_MESSAGES.TECHNICAL.NETWORK_ERROR
      }
    };

    const errorInfo = errorMap[error.type] || {
      status: 500,
      message: ERROR_MESSAGES.TECHNICAL.SERVER_ERROR
    };

    return {
      status: errorInfo.status,
      body: {
        success: false,
        message: errorInfo.message,
        code: error.code
      }
    };
  }

  static handleMongoError(error) {
    if (error.code === 11000) {
      return {
        status: 409,
        body: {
          success: false,
          message: ERROR_MESSAGES.RESOURCE.ALREADY_EXISTS
        }
      };
    }

    return {
      status: 500,
      body: {
        success: false,
        message: ERROR_MESSAGES.TECHNICAL.DATABASE_ERROR
      }
    };
  }
}

export default ErrorService;
