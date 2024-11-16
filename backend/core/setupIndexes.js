// backend/core/setupIndexes.js

import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';

export const setupIndexes = async () => {
  try {
    // Index utilisateurs
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ isAdmin: 1 });
    await User.collection.createIndex({ email: 1, username: 1 });

    // Index catégories
    await Category.collection.createIndex({ name: 1 }, { unique: true });
    await Category.collection.createIndex({ slug: 1 }, { unique: true });

    // Index produits
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ name: 'text', brand: 'text', description: 'text' });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ rating: -1 });
    await Product.collection.createIndex({ createdAt: -1 });

    // Index commandes
    await Order.collection.createIndex({ user: 1 });
    await Order.collection.createIndex({ 'orderItems.product': 1 });
    await Order.collection.createIndex({ 'paymentResult.id': 1 }, { sparse: true });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ user: 1, createdAt: -1 });
    await Order.collection.createIndex({ status: 1, createdAt: -1 });

    // Index panier
    await Cart.collection.createIndex({ user: 1 }, { unique: true });

    console.log('✅ Database indexes setup complete');
  } catch (error) {
    console.error('Error setting up indexes:', error);
    throw error;
  }
};
