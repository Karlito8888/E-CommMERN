// backend/models/cartModel.js

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
    validate: {
      validator: Number.isInteger,
      message: 'La quantité doit être un nombre entier'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calcul du sous-total pour chaque article
cartItemSchema.virtual('subtotal').get(function() {
  return Math.round((this.price * this.quantity) * 100) / 100;
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calcul des totaux du panier
cartSchema.virtual('itemsPrice').get(function() {
  return Math.round(this.items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
});

cartSchema.virtual('shippingPrice').get(function() {
  return this.itemsPrice > 100 ? 0 : 10;
});

cartSchema.virtual('taxPrice').get(function() {
  return Math.round((this.itemsPrice * 0.20) * 100) / 100;
});

cartSchema.virtual('totalPrice').get(function() {
  return Math.round((this.itemsPrice + this.shippingPrice + this.taxPrice) * 100) / 100;
});

// Mise à jour automatique de la date
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware pour mettre à jour la date lors des mises à jour
cartSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model('Cart', cartSchema);
