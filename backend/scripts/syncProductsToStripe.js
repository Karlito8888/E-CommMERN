// backend/syncProductsToStripe.js
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Charge les variables d'environnement

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Connectez-vous à MongoDB
mongoose.connect(process.env.MONGO_URI);

// Modèle MongoDB pour les produits
import Product from "../models/productModel.js"; // Correction du chemin d'importation

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
    console.log("Début de la synchronisation avec Stripe...");
    
    // Récupérer tous les produits dans MongoDB
    const products = await Product.find({});
    console.log(`${products.length} produits trouvés dans MongoDB`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Créez un produit Stripe
        const stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          images: [getImageUrl(product.image)], // Utiliser la fonction utilitaire
          metadata: {
            brand: product.brand || '',
            category_id: product.category ? product.category.toString() : '',
            stock: (product.countInStock || 0).toString(), // Utiliser countInStock au lieu de stock
            rating: (product.rating || 0).toString(),
            numReviews: (product.numReviews || 0).toString(),
          },
        });

        // Créez un prix pour chaque produit Stripe
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(product.price * 100), // Convertir en centimes
          currency: 'eur',
        });

        // Mettre à jour le produit MongoDB avec les IDs Stripe
        await Product.updateOne(
          { _id: product._id },
          { 
            $set: {
              stripeProductId: stripeProduct.id,
              stripePriceId: price.id
            }
          }
        );

        successCount++;
        if (successCount % 10 === 0) {
          console.log(`${successCount} produits synchronisés...`);
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation du produit ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log("\nSynchronisation terminée !");
    console.log(`Succès: ${successCount} produits`);
    console.log(`Erreurs: ${errorCount} produits`);

  } catch (error) {
    console.error("Erreur lors de la synchronisation :", error);
  } finally {
    mongoose.disconnect();
  }
};

// Appel de la fonction de synchronisation
syncProducts();
