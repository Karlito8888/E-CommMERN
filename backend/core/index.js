// backend/core/index.js

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from 'bcryptjs';
import User from "../models/userModel.js";

// ====== Constants ======
export const TAX_RATE = 0.20; // TVA 20%
export const SALT_ROUNDS = 10;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_BLOCK_DURATION = 15 * 60; // 15 minutes en secondes

// ====== Database Configuration ======
export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    // Optimisations MongoDB
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    mongoose.set('toJSON', { 
      virtuals: true,
      transform: (_, converted) => {
        delete converted._id;
        delete converted.__v;
        return converted;
      }
    });

    console.log(`Successfully connected to MongoDB: ${conn.connection.name} 👍`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// ====== Express Configuration ======
export const configureApp = (app) => {
  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  }));
  
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Basic Middleware
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // Development Logging
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });
  }

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

// ====== Utility Functions ======
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const validateFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Champs requis manquants: ${missingFields.join(', ')}`
    };
  }
  return { isValid: true };
};

export const checkId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('ID invalide');
  }
  next();
};

// ====== Error Handling ======
export const notFound = (req, res) => {
  res.status(404);
  throw new Error(`Route non trouvée - ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Une entrée avec ces données existe déjà';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

// ====== Security Functions ======
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Le mot de passe doit contenir au moins ${minLength} caractères`
    };
  }

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    };
  }

  return { isValid: true };
};

export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
    algorithm: 'HS256'
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  });
};

// ====== Email Configuration ======
let emailTransporter = null;

export const createTransporter = () => {
  if (emailTransporter) return emailTransporter;

  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  // Vérifier la connexion
  emailTransporter.verify((error) => {
    if (error) {
      console.error('Erreur de configuration email:', error);
    } else {
      console.log('Serveur email prêt 📧');
    }
  });

  return emailTransporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('Email envoyé:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    return false;
  }
};

// ====== Authentication Middleware ======
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    throw new Error('Non autorisé - Pas de token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!user) {
      res.status(401);
      throw new Error('Non autorisé - Utilisateur non trouvé');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Non autorisé - Token invalide');
  }
});

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Non autorisé - Accès administrateur requis');
  }
};

// Export par défaut des fonctionnalités les plus utilisées
export default {
  setup: {
    connectDB,
    configureApp
  },
  security: {
    authenticate,
    authorizeAdmin,
    generateToken,
    validatePassword,
    hashPassword
  },
  utils: {
    asyncHandler,
    checkId,
    validateFields,
    sendEmail
  },
  error: {
    notFound,
    errorHandler
  }
};
