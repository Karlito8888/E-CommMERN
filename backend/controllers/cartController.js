// backend/controllers/cartController.js

import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import { asyncHandler } from '../core/index.js';

// Valider le panier (utilisé pour les utilisateurs connectés et non connectés)
const validateCart = async (items) => {
  if (!Array.isArray(items)) {
    throw new Error('Format de panier invalide');
  }

  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } })
    .select('_id name price stock')
    .lean();

  const validatedItems = [];
  const errors = [];

  items.forEach(item => {
    const product = products.find(p => p._id.toString() === item.product);
    if (!product) {
      errors.push(`Produit introuvable: ${item.product}`);
    } else if (product.stock < item.quantity) {
      errors.push(`Stock insuffisant pour ${product.name}: ${product.stock} disponible(s)`);
    } else {
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
  });

  return { validatedItems, errors, products };
};

// Valider le panier sans authentification (pour les utilisateurs non connectés)
const validateGuestCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const { validatedItems, errors, products } = await validateCart(items);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Calculer les totaux
  const total = validatedItems.reduce((sum, item) => {
    const product = products.find(p => p._id.toString() === item.product.toString());
    return sum + (product.price * item.quantity);
  }, 0);

  res.json({
    items: validatedItems,
    total,
    isValid: true
  });
});

// Récupérer le panier (utilisateur connecté)
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price stock image')
    .lean();

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
});

// Synchroniser le panier (utilisateur connecté)
const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const { validatedItems, errors } = await validateCart(items);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { 
      items: validatedItems,
      updatedAt: Date.now()
    },
    { 
      new: true, 
      upsert: true 
    }
  ).populate('items.product', 'name price stock image');

  res.json(cart);
});

// Vider le panier (utilisateur connecté)
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { new: true }
  );

  res.json({ message: 'Panier vidé' });
});

export {
  validateGuestCart,
  getCart,
  syncCart,
  clearCart
};
