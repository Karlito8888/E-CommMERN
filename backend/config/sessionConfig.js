// backend/config/sessionConfig.js

import session from 'express-session';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes

// Schéma pour les sessions
const SessionSchema = new mongoose.Schema({
  _id: String,
  expires: Date,
  session: Object
}, { collection: 'sessions' });

// Modèle pour les sessions
const SessionModel = mongoose.models.Session || mongoose.model('Session', SessionSchema);

// Store personnalisé utilisant mongoose
class MongooseStore extends session.Store {
  constructor() {
    super();
    this.model = SessionModel;
  }

  get(sid, callback) {
    this.model.findById(sid)
      .then(session => {
        if (!session) return callback(null, null);
        if (session.expires && session.expires < new Date()) {
          this.destroy(sid, () => callback(null, null));
          return;
        }
        callback(null, session.session);
      })
      .catch(err => callback(err));
  }

  set(sid, session, callback) {
    const expires = new Date(Date.now() + THIRTY_DAYS);
    this.model.findByIdAndUpdate(
      sid,
      { expires, session },
      { upsert: true, new: true }
    )
      .then(() => callback(null))
      .catch(err => callback(err));
  }

  destroy(sid, callback) {
    this.model.findByIdAndDelete(sid)
      .then(() => callback(null))
      .catch(err => callback(err));
  }

  touch(sid, session, callback) {
    const expires = new Date(Date.now() + THIRTY_DAYS);
    this.model.findByIdAndUpdate(
      sid,
      { expires },
      { new: true }
    )
      .then(() => callback(null))
      .catch(err => callback(err));
  }

  // Méthode pour nettoyer les sessions expirées
  async clear(callback) {
    try {
      await this.model.deleteMany({ expires: { $lt: new Date() } });
      callback && callback(null);
    } catch (err) {
      callback && callback(err);
    }
  }
}

const sessionConfig = {
  // Configuration de base
  secret: process.env.JWT_SECRET || 'your-secret-key',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,

  // Utilisation de notre store personnalisé
  store: new MongooseStore(),

  // Configuration des cookies
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: THIRTY_DAYS,
    sameSite: 'lax',
    path: '/',
  },

  // Génération d'un ID de session unique
  genid: () => uuidv4(),
};

// Middleware de gestion des erreurs de session
export const handleSessionErrors = (err, req, res, next) => {
  if (err.name === 'MongoError') {
    logger.error('Erreur MongoDB avec les sessions:', err);
    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        logger.error('Erreur lors de la régénération de la session:', regenerateErr);
        return next(regenerateErr);
      }
      next(err);
    });
  } else {
    next(err);
  }
};

// Middleware de rotation des sessions
export const rotateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    const lastRotation = req.session.lastRotation || 0;
    const now = Date.now();
    
    // Rotation toutes les 24 heures
    if (now - lastRotation > 24 * 60 * 60 * 1000) {
      const userData = req.session.user;
      
      req.session.regenerate((err) => {
        if (err) {
          logger.error('Erreur lors de la rotation de la session:', err);
          return next(err);
        }
        
        req.session.user = userData;
        req.session.lastRotation = now;
        req.session.save((saveErr) => {
          if (saveErr) {
            logger.error('Erreur lors de la sauvegarde de la session:', saveErr);
            return next(saveErr);
          }
          next();
        });
      });
    } else {
      next();
    }
  } else {
    next();
  }
};

// Middleware de protection contre la fixation de session
export const preventSessionFixation = (req, res, next) => {
  if (req.session.isAuthenticated && !req.session.isFixed) {
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.isFixed = true;
      next();
    });
  } else {
    next();
  }
};

// Fonction de nettoyage des sessions inactives
export const cleanInactiveSessions = async () => {
  try {
    const store = new MongooseStore();
    await store.clear();
    logger.info('Sessions inactives nettoyées');
  } catch (err) {
    logger.error('Erreur lors du nettoyage des sessions:', err);
  }
};

export default sessionConfig;
