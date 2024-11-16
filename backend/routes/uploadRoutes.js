// backend/routes/uploadRoutes.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { authenticate, authorizeAdmin } from '../core/index.js';

const router = express.Router();

// Configuration du stockage
const storage = multer.memoryStorage();

// Configuration de multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images uniquement! (.jpg, .jpeg, .png, .webp)'));
  },
});

// Middleware de traitement d'image
export const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    
    // Création du thumbnail
    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFormat('webp')
      .toFile(`uploads/thumbnails/${filename}.webp`);

    // Image principale
    await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFormat('webp')
      .toFile(`uploads/${filename}.webp`);

    // Ajouter les chemins à la requête
    req.processedImage = {
      main: `/uploads/${filename}.webp`,
      thumbnail: `/uploads/thumbnails/${filename}.webp`
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Route d'upload standalone (si nécessaire)
router.post('/', authenticate, authorizeAdmin, upload.single('image'), processImage, (req, res) => {
  if (!req.processedImage) {
    return res.status(400).json({ 
      success: false, 
      message: 'Aucune image fournie' 
    });
  }

  res.json({ 
    success: true,
    data: req.processedImage
  });
});

export default router;
