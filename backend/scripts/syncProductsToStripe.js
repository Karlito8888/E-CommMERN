// backend/syncProductsToStripe.js
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis le fichier .env à la racine du projet
dotenv.config({ path: join(__dirname, '../../.env') });

// Vérifier les variables d'environnement
console.log('Vérification des variables d\'environnement :');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✓ définie' : '✗ non définie');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Vérifier la connexion MongoDB
if (!process.env.MONGO_URI) {
  console.error('Erreur : MONGO_URI n\'est pas définie dans le fichier .env');
  process.exit(1);
}

// Connectez-vous à MongoDB
mongoose.connect(process.env.MONGO_URI);

// Modèle MongoDB pour les produits
import Product from "../models/productModel.js";

// Fonction utilitaire pour obtenir l'URL de l'image
const getImageUrl = (imagePath) => {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${process.env.BASE_IMAGE_URL}${imagePath}`;
};

// Fonction pour nettoyer les produits Stripe obsolètes
const cleanupStripeProducts = async (mongoProducts) => {
  const mongoProductIds = new Set(
    mongoProducts
      .filter(p => p.stripeProductId)
      .map(p => p.stripeProductId)
  );

  const stripeProducts = await stripe.products.list({ limit: 100, active: true });
  
  for (const stripeProduct of stripeProducts.data) {
    if (!mongoProductIds.has(stripeProduct.id)) {
      console.log(`Suppression du produit Stripe obsolète: ${stripeProduct.name}`);
      await stripe.products.update(stripeProduct.id, { active: false });
    }
  }
};

// Fonction principale de synchronisation
const syncProducts = async () => {
  try {
    console.log("Début de la synchronisation avec Stripe...");
    
    // Récupérer tous les produits dans MongoDB
    const products = await Product.find({}).populate('reviews');
    console.log(`${products.length} produits trouvés dans MongoDB`);

    // Nettoyer les produits Stripe obsolètes
    await cleanupStripeProducts(products);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        // Vérifier si le produit existe déjà dans Stripe
        let stripeProduct;
        let stripePrice;

        if (product.stripeProductId) {
          try {
            stripeProduct = await stripe.products.retrieve(product.stripeProductId);
            // Mettre à jour le produit existant
            stripeProduct = await stripe.products.update(product.stripeProductId, {
              name: product.name,
              description: product.description,
              images: [getImageUrl(product.image)],
              metadata: {
                brand: product.brand || '',
                category_id: product.category ? product.category.toString() : '',
                stock: (product.countInStock || 0).toString(),
                rating: (product.rating || 0).toString(),
                numReviews: (product.numReviews || 0).toString(),
                reviews_summary: product.reviews ? 
                  product.reviews.slice(0, 3).map(r => `${r.rating}★: ${r.comment.substring(0, 50)}...`).join(' | ') : '',
              },
            });
            skippedCount++;
            continue;
          } catch (error) {
            if (error.code === 'resource_missing') {
              // Le produit n'existe plus dans Stripe, on va le recréer
              product.stripeProductId = null;
              product.stripePriceId = null;
            }
          }
        }

        // Créer un nouveau produit si nécessaire
        if (!product.stripeProductId) {
          stripeProduct = await stripe.products.create({
            name: product.name,
            description: product.description,
            images: [getImageUrl(product.image)],
            metadata: {
              brand: product.brand || '',
              category_id: product.category ? product.category.toString() : '',
              stock: (product.countInStock || 0).toString(),
              rating: (product.rating || 0).toString(),
              numReviews: (product.numReviews || 0).toString(),
              reviews_summary: product.reviews ? 
                product.reviews.slice(0, 3).map(r => `${r.rating}★: ${r.comment.substring(0, 50)}...`).join(' | ') : '',
            },
          });

          // Créer un nouveau prix
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(product.price * 100),
            currency: 'eur',
          });

          // Mettre à jour le produit MongoDB avec les IDs Stripe
          await Product.updateOne(
            { _id: product._id },
            { 
              $set: {
                stripeProductId: stripeProduct.id,
                stripePriceId: stripePrice.id
              }
            }
          );

          successCount++;
          if (successCount % 10 === 0) {
            console.log(`${successCount} nouveaux produits synchronisés...`);
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation du produit ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log("\nSynchronisation terminée !");
    console.log(`Nouveaux produits: ${successCount}`);
    console.log(`Produits existants mis à jour: ${skippedCount}`);
    console.log(`Erreurs: ${errorCount}`);

  } catch (error) {
    console.error("Erreur lors de la synchronisation :", error);
  } finally {
    await mongoose.disconnect();
  }
};

// Appel de la fonction de synchronisation
syncProducts();
