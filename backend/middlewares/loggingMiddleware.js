// backend/middlewares/loggingMiddleware.js

import logger from '../utils/logger.js';

// Middleware pour logger les requêtes
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Fonction pour logger la réponse
  const logResponse = () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Ajouter l'ID utilisateur si disponible
    if (req.session && req.session.user) {
      logData.userId = req.session.user.id;
    }

    // Logger différemment selon le statut de la réponse
    if (res.statusCode >= 400) {
      logger.warn('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  };

  // Écouter la fin de la réponse
  res.on('finish', logResponse);
  res.on('close', logResponse);

  next();
};

// Middleware pour logger les erreurs
export const errorLogger = (err, req, res, next) => {
  const logData = {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
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
  };

  // Ajouter l'ID utilisateur si disponible
  if (req.session && req.session.user) {
    logData.userId = req.session.user.id;
  }

  logger.error('Request error', logData);
  next(err);
};

// Middleware pour logger les événements de session
export const sessionLogger = (req, res, next) => {
  const sessionEvents = {
    // Événement de création de session
    create: () => {
      logger.info('Session created', {
        sessionId: req.sessionID,
        userId: req.session.user?.id,
      });
    },

    // Événement de destruction de session
    destroy: () => {
      logger.info('Session destroyed', {
        sessionId: req.sessionID,
        userId: req.session.user?.id,
      });
    },

    // Événement de régénération de session
    regenerate: () => {
      logger.info('Session regenerated', {
        oldSessionId: req.sessionID,
        userId: req.session.user?.id,
      });
    },

    // Événement de mise à jour de session
    save: () => {
      logger.debug('Session saved', {
        sessionId: req.sessionID,
        userId: req.session.user?.id,
      });
    }
  };

  // Attacher les événements à la session
  if (req.session) {
    req.session.on('create', sessionEvents.create);
    req.session.on('destroy', sessionEvents.destroy);
    req.session.on('regenerate', sessionEvents.regenerate);
    req.session.on('save', sessionEvents.save);
  }

  next();
};
