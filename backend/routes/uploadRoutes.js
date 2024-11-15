// backend/routes/uploadRoutes.js

import express from 'express';
import { uploadSingleFile } from '../services/fileService.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/", authenticate, authorizeAdmin, uploadSingleFile("image"), (req, res) => {
  if (req.file) {
    res.status(200).json({
      message: "Image téléchargée avec succès",
      image: `/${req.file.path}`,
    });
  } else {
    res.status(400).json({ message: "Aucune image fournie" });
  }
});

export default router;
