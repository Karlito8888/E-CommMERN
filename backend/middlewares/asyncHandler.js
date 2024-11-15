// backend/middlewares/asyncHandler.js

import { APIError } from './errorMiddleware.js';
import logger from '../utils/logger.js';

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Logger l'erreur avec le contexte de la requête
    logger.error('Request error', {
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
      },
      request: {
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        userId: req.user?._id
      }
    });

    // Passer l'erreur au middleware d'erreur
    next(error instanceof APIError ? error : new APIError(error.message, 500));
  });
};

export default asyncHandler;
