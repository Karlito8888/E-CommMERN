// backend/index.js

import path from "path";
import express from "express";
import dotenv from "dotenv";
import { 
  connectDB, 
  configureApp,
  errorHandler,
  notFound 
} from "./core/index.js";

/**
 * Import des routes de l'API
 * Ordre logique :
 * 1. Authentification et utilisateurs
 * 2. Catalogue (catégories, produits)
 * 3. Panier et commandes
 * 4. Paiements
 * 5. Utilitaires (upload)
 */
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Configuration des variables d'environnement
dotenv.config();
const port = process.env.PORT || 5000;

// Initialisation de l'application
const app = express();

// Configuration de la base de données et des middlewares
await connectDB();
configureApp(app);

/**
 * Configuration des routes de l'API
 * Préfixe commun : /api
 * 
 * Routes publiques :
 * - POST   /api/users/login     - Connexion
 * - POST   /api/users/register  - Inscription
 * - GET    /api/products        - Liste des produits
 * - GET    /api/categories      - Liste des catégories
 * - POST   /api/cart/guest/validate - Validation panier invité
 * 
 * Routes authentifiées :
 * - GET    /api/users/profile   - Profil utilisateur
 * - PUT    /api/users/profile   - Mise à jour profil
 * - GET    /api/cart            - Récupérer panier
 * - POST   /api/cart            - Synchroniser panier
 * - DELETE /api/cart            - Vider panier
 * - POST   /api/orders          - Créer commande
 * - GET    /api/orders          - Liste commandes
 * - GET    /api/orders/:id      - Détails commande
 * - POST   /api/payments        - Paiement commande
 */

// Routes utilisateurs et authentification
app.use("/api/users", userRoutes);

// Routes catalogue
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Routes panier et commandes
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Routes utilitaires
app.use("/api/upload", uploadRoutes);

// Dossier uploads
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

/**
 * Configuration de l'environnement de production
 * En production : Serve le frontend depuis /frontend/dist
 * En développement : Message API is running
 */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

// Gestion des erreurs
app.use('*', notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
});

// Export pour les tests
export default app;
