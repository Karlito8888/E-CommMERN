// backend/index.js

import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors"; // Importer CORS

// Utiles
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";


dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

// Configuration de CORS
const corsOptions = {
  origin: 'http://localhost:5173', // L'URL de ton frontend React (en développement)
  methods: 'GET,POST,PUT,DELETE', // Les méthodes HTTP autorisées
  allowedHeaders: 'Content-Type,Authorization', // En-têtes autorisés
};

app.use(cors(corsOptions)); // Appliquer CORS

app.use(helmet());
app.use(express.json()); // Pour le parsing JSON classique
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route spécifique pour le Webhook Stripe (nécessite le contenu brut)
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes
);

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

const __dirname = path.resolve();
app.use(
  "/uploads",
  express.static(path.join(__dirname, "/uploads"), {
    setHeaders: (res) => {
      res.set("Cache-Control", "public, max-age=86400"); // Cache pendant 1 jour
    },
  })
);

// Gestion des routes inconnues
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => console.log(`Server running on port: ${port}`));

export default app; // Ajout de l'export default
