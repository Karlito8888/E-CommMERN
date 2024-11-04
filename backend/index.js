// backend/index.js
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Utiles
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/orders", orderRoutes);

// app.get("/api/config/paypal", (req, res) => {
//   if (!process.env.PAYPAL_CLIENT_ID) {
//     return res.status(500).send("PayPal client ID is not set");
//   }
//   res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
// });

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

