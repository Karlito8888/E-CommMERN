// backend/middlewares/errorMiddleware.js

import logger from '../utils/logger.js';

// Classe personnalisée pour les erreurs d'API
export class APIError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Middleware pour gérer les routes non trouvées
export const notFound = (req, res, next) => {
  const error = new APIError(`Route non trouvée - ${req.originalUrl}`, 404);
  next(error);
};

// Middleware unifié de gestion des erreurs
export const errorHandler = (err, req, res, next) => {
  // Préparer les données de log communes
  const logData = {
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    },
    request: {
      method: req.method,
      path: req.originalUrl || req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    userId: req.user?._id
  };

  // Logger l'erreur
  logger.error('Request error', logData);

  // Gérer les différents types d'erreurs
  let statusCode = 500;
  let responseBody = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : err.message
  };

  // APIError personnalisée
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    responseBody.message = err.message;
    if (err.details) responseBody.details = err.details;
  }
  // Erreurs de validation Mongoose
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    responseBody.message = 'Erreur de validation';
    responseBody.details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  }
  // Erreurs JWT
  else if (['JsonWebTokenError', 'TokenExpiredError'].includes(err.name)) {
    statusCode = 401;
    responseBody.message = 'Token invalide ou expiré';
  }
  // Erreurs MongoDB
  else if (['MongoError', 'MongoServerError'].includes(err.name)) {
    statusCode = err.code === 11000 ? 409 : 500;
    responseBody.message = err.code === 11000 
      ? 'Conflit de données - Cette entrée existe déjà'
      : 'Erreur de base de données';
  }

  // Ajouter la stack en développement
  if (process.env.NODE_ENV !== 'production') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};
