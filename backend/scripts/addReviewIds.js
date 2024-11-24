// backend/scripts/addReviewIds.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

const addReviewIds = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/MERN-STORE');
    console.log('Connected to MongoDB');

    // Utiliser directement la collection pour la mise à jour
    const products = await mongoose.connection.collection('products').find({}).toArray();
    let updatedCount = 0;

    for (const product of products) {
      if (!product.reviews) continue;

      let hasUpdates = false;
      const updatedReviews = product.reviews.map(review => {
        if (!review._id) {
          hasUpdates = true;
          return {
            ...review,
            _id: new mongoose.Types.ObjectId()
          };
        }
        return review;
      });

      if (hasUpdates) {
        await mongoose.connection.collection('products').updateOne(
          { _id: product._id },
          { $set: { reviews: updatedReviews } }
        );
        updatedCount++;
      }
    }

    console.log(`Updated reviews for ${updatedCount} products`);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Exécuter la migration
addReviewIds();
