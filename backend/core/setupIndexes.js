// backend/core/setupIndexes.js

import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import slugify from 'slugify';

const dropCollectionIndexes = async (collection) => {
  try {
    if (collection.collectionName) {
      await collection.dropIndexes();
    }
  } catch (error) {
    // Ignorer l'erreur si la collection n'existe pas encore
    if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') {
      console.warn(`Warning: Could not drop indexes for ${collection.collectionName}: ${error.message}`);
    }
  }
};

const cleanupData = async () => {
  try {
    console.log('🧹 Cleaning up data before creating indexes...');

    // Nettoyer les catégories avec des slugs nuls ou invalides
    const categories = await Category.find({ $or: [
      { slug: null },
      { slug: '' },
      { slug: { $exists: false } }
    ]});

    for (const category of categories) {
      if (!category.name) {
        await Category.deleteOne({ _id: category._id });
      } else {
        category.slug = slugify(category.name, { lower: true, strict: true });
        await category.save();
      }
    }

    // Supprimer les doublons de slug dans les catégories
    const slugCounts = await Category.aggregate([
      { $group: { 
        _id: "$slug", 
        count: { $sum: 1 },
        docs: { $push: "$$ROOT" }
      }},
      { $match: { count: { $gt: 1 } }}
    ]);

    for (const group of slugCounts) {
      // Garder le premier document et mettre à jour les autres
      const [keep, ...duplicates] = group.docs;
      for (const dup of duplicates) {
        const category = await Category.findById(dup._id);
        if (category) {
          category.slug = `${slugify(category.name, { lower: true, strict: true })}-${category._id.toString().slice(-4)}`;
          await category.save();
        }
      }
    }
  } catch (error) {
    console.warn('Warning during data cleanup:', error.message);
  }
};

export const setupIndexes = async () => {
  try {
    console.log('🔄 Setting up database indexes...');

    // Supprimer tous les index existants
    await Promise.all([
      dropCollectionIndexes(User.collection),
      dropCollectionIndexes(Category.collection),
      dropCollectionIndexes(Product.collection),
      dropCollectionIndexes(Order.collection),
      dropCollectionIndexes(Cart.collection),
    ]);

    // Nettoyer les données avant de créer les index
    await cleanupData();

    // Créer les nouveaux index
    const indexPromises = [
      // Index utilisateurs
      User.collection.createIndex({ email: 1 }, { unique: true }),
      User.collection.createIndex({ isAdmin: 1 }),
      User.collection.createIndex({ email: 1, username: 1 }),

      // Index catégories
      Category.collection.createIndex({ name: 1 }, { unique: true }),
      Category.collection.createIndex({ slug: 1 }, { unique: true }),

      // Index produits
      Product.collection.createIndex({ category: 1 }),
      Product.collection.createIndex(
        { name: 'text', brand: 'text', description: 'text' }
      ),
      Product.collection.createIndex({ price: 1 }),
      Product.collection.createIndex({ rating: -1 }),
      Product.collection.createIndex({ createdAt: -1 }),

      // Index commandes
      Order.collection.createIndex({ user: 1 }),
      Order.collection.createIndex({ 'orderItems.product': 1 }),
      Order.collection.createIndex({ 'paymentResult.id': 1 }, { sparse: true }),
      Order.collection.createIndex({ status: 1 }),
      Order.collection.createIndex({ user: 1, createdAt: -1 }),
      Order.collection.createIndex({ status: 1, createdAt: -1 }),

      // Index panier
      Cart.collection.createIndex({ user: 1 }, { unique: true }),
    ];

    await Promise.allSettled(indexPromises);
    console.log('✅ Database indexes setup complete');
  } catch (error) {
    console.error('❌ Error setting up indexes:', error.message);
    // Ne pas faire planter le serveur, juste logger l'erreur
  }
};
