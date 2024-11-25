import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../../.env') });

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Fonction pour générer une date aléatoire entre deux dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Schéma du produit pour MongoDB
const productSchema = new mongoose.Schema({
  name: String,
  reviews: [{
    createdAt: Date
  }]
});

const Product = mongoose.model('Product', productSchema);

// Mettre à jour les dates des avis
const updateReviewDates = async () => {
  try {
    // Récupérer tous les produits avec des avis
    const products = await Product.find({ 'reviews.0': { $exists: true } });
    
    // Date de début : 1 an en arrière
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    // Date de fin : aujourd'hui
    const endDate = new Date();
    
    // Pour chaque produit
    for (const product of products) {
      if (product.reviews && product.reviews.length > 0) {
        // Mettre à jour chaque avis avec une date aléatoire
        const updatedReviews = product.reviews.map(review => {
          review.createdAt = randomDate(startDate, endDate);
          return review;
        });
        
        // Trier les avis par date décroissante
        updatedReviews.sort((a, b) => b.createdAt - a.createdAt);
        
        // Mettre à jour le produit
        product.reviews = updatedReviews;
        await product.save();
        
        console.log(`✅ Mis à jour ${updatedReviews.length} avis pour le produit ${product.name}`);
      }
    }
    
    console.log('🎉 Mise à jour des dates terminée !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
};

// Exécuter la mise à jour
updateReviewDates();
