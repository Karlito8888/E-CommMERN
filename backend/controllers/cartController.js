// backend/controllers/cartController.js

import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import { asyncHandler } from '../core/index.js';

// Valider le panier (utilisé pour les utilisateurs connectés et non connectés)
const validateCart = async (items) => {
  if (!Array.isArray(items)) {
    throw new Error('Format de panier invalide');
  }

  if (items.some(item => !item.product || !item.quantity)) {
    throw new Error('Format d\'article invalide');
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
      return;
    }
    
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push(`Quantité invalide pour ${product.name}: minimum 1`);
      return;
    }
    
    if (product.stock < item.quantity) {
      errors.push(`Stock insuffisant pour ${product.name}: ${product.stock} disponible(s)`);
      return;
    }
    
    validatedItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });
  });

  return { validatedItems, errors };
};

// Valider le panier sans authentification (pour les utilisateurs non connectés)
const validateGuestCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  if (!items) {
    return res.status(400).json({ 
      errors: ['Le panier est requis'] 
    });
  }

  try {
    const { validatedItems, errors } = await validateCart(items);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Créer un panier temporaire pour calculer les totaux
    const tempCart = new Cart({ 
      user: null, 
      items: validatedItems 
    });

    res.json({
      items: validatedItems,
      itemsPrice: tempCart.itemsPrice,
      shippingPrice: tempCart.shippingPrice,
      taxPrice: tempCart.taxPrice,
      totalPrice: tempCart.totalPrice,
      isValid: true
    });
  } catch (error) {
    res.status(400).json({ 
      errors: [error.message] 
    });
  }
});

// Récupérer le panier (utilisateur connecté)
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price stock image');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
    return res.json(cart);
  }

  // Revalider le panier pour vérifier les stocks
  const { validatedItems, errors } = await validateCart(cart.items);

  if (errors.length > 0) {
    // Mettre à jour le panier avec les articles valides
    cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: validatedItems },
      { new: true }
    ).populate('items.product', 'name price stock image');
  }

  res.json({
    ...cart.toJSON(),
    errors: errors.length > 0 ? errors : undefined
  });
});

// Synchroniser le panier (utilisateur connecté)
const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items) {
    return res.status(400).json({ 
      errors: ['Le panier est requis'] 
    });
  }

  try {
    const { validatedItems, errors } = await validateCart(items);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: validatedItems },
      { 
        new: true, 
        upsert: true 
      }
    ).populate('items.product', 'name price stock image');

    res.json(cart);
  } catch (error) {
    res.status(400).json({ 
      errors: [error.message] 
    });
  }
});

// Vider le panier (utilisateur connecté)
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { new: true }
  );

  res.json(cart);
});

export {
  validateGuestCart,
  getCart,
  syncCart,
  clearCart
};
