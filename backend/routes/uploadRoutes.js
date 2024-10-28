import path from "path";
import express from "express";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || "uploads/";

// Configuration de stockage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  },
});

// Filtrage du type de fichier et taille maximale
const fileFilter = (req, file, cb) => {
  const allowedFiletypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = allowedFiletypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Seules les images de type JPG, PNG ou WEBP sont autorisées"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
});

const uploadSingleImage = upload.single("image");

// Route de téléchargement d'image
router.post("/", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: `Erreur Multer: ${err.message}` });
    } else if (err) {
      return res.status(400).send({ message: `Erreur: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).send({ message: "Aucun fichier d'image fourni" });
    }

    res.status(200).send({
      message: "Image téléchargée avec succès",
      imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`,
    });
  });
});

export default router;
