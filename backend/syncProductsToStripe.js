// backend/syncProductsToStripe.js
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Charge les variables d'environnement

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Connectez-vous à MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Modèle MongoDB pour les produits
import Product from "./models/productModel.js"; // Modèle correspondant à votre produit

// Fonction utilitaire pour obtenir l'URL de l'image
const getImageUrl = (imagePath) => {
  // Vérifier si l'image est une URL ou un chemin local
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath; // Utiliser directement si c'est déjà une URL
  }
  // Si c'est un chemin local, préfixer avec l'URL de base
  return `${process.env.BASE_IMAGE_URL}${imagePath}`;
};

// Fonction principale de synchronisation
const syncProducts = async () => {
  try {
    // Récupérer tous les produits dans MongoDB
    const products = await Product.find({});

    for (const product of products) {
      // Créez un produit Stripe
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        images: [getImageUrl(product.image)], // Utiliser la fonction utilitaire
        metadata: {
          brand: product.brand,
          category_id: product.category.toString(),
          stock: product.stock.toString(),
          rating: product.rating.toString(),
          numReviews: product.numReviews.toString(),
        },
      });

      // Mettre à jour le produit MongoDB avec l'ID du produit Stripe
      product.stripeProductId = stripeProduct.id; // Assurez-vous d'ajouter ce champ dans votre modèle MongoDB
      await product.save();

      // Créez un prix pour chaque produit Stripe
      const priceInCents = Math.round(product.price * 100); // Utilisation de Math.round pour éviter les erreurs de précision
      await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: priceInCents, // Utilisez priceInCents ici
        currency: product.currency.toLowerCase(),
      });

      console.log(`Produit synchronisé : ${product.name}`);
    }

    console.log("Tous les produits ont été synchronisés avec Stripe.");
  } catch (error) {
    console.error("Erreur de synchronisation : ", error);
  } finally {
    // Fermez la connexion à la base de données
    mongoose.connection.close();
  }
};

// Appel de la fonction de synchronisation
syncProducts();
