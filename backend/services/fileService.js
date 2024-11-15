import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { APIError } from '../middlewares/errorMiddleware.js';
import logger from '../utils/logger.js';

class FileService {
  static async handleImageUpload(file) {
    if (!file) return null;
    return `/uploads/${file.filename}`;
  }

  static async deleteImage(imagePath) {
    if (!imagePath || !imagePath.startsWith('/uploads')) return;

    const fullPath = path.join(process.cwd(), imagePath);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        logger.info('Image supprimée avec succès', { path: imagePath });
      }
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'image', { 
        path: imagePath,
        error: error.message 
      });
      throw new APIError('Erreur lors de la suppression de l\'image', 500);
    }
  }

  static async ensureDirectoryExists(directoryPath) {
    try {
      await fs.promises.access(directoryPath);
    } catch (error) {
      await fs.promises.mkdir(directoryPath, { recursive: true });
      logger.info('Répertoire créé avec succès', { path: directoryPath });
    }
  }

  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  static generateUniqueFilename(originalFilename) {
    const extension = this.getFileExtension(originalFilename);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}${extension}`;
  }
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    await FileService.ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = FileService.generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(FileService.getFileExtension(file.originalname));
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Middleware pour gérer l'upload d'un seul fichier
const uploadSingleFile = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Le fichier est trop volumineux (max 5MB)' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (req.file) {
        req.file.path = FileService.handleImageUpload(req.file);
      }
      next();
    });
  };
};

// Fonction pour supprimer un fichier
const deleteFile = async (filePath) => {
  await FileService.deleteImage(filePath);
};

export {
  FileService,
  upload,
  uploadSingleFile,
  deleteFile
};
