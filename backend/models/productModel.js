// backend/models/productModel.js

import mongoose from "mongoose";
import PriceService from '../services/priceService.js';
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      minlength: 2, 
      maxlength: 100 
    },
    image: { 
      type: String, 
      required: true 
    },
    brand: { 
      type: String, 
      required: true, 
      minlength: 2, 
      maxlength: 100 
    },
    category: { 
      type: ObjectId, 
      ref: "Category", 
      required: true 
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000
    },
    reviews: [reviewSchema],
    rating: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0, 
      max: 5 
    },
    numReviews: { 
      type: Number, 
      required: true, 
      default: 0 
    },
    price: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0,
      description: "Prix TTC du produit" 
    },
    priceHT: {
      type: Number,
      required: false,
      description: "Prix HT calculé automatiquement"
    },
    taxAmount: {
      type: Number,
      required: false,
      description: "Montant de la TVA calculé automatiquement"
    },
    currency: { 
      type: String, 
      required: true, 
      default: "EUR" 
    },
    stock: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0,
      description: "Stock total disponible"
    },
    quantity: { 
      type: Number, 
      default: 0,
      description: "Quantité à ajouter/retirer du stock" 
    },
    stripeProductId: { 
      type: String, 
      required: false 
    }
  },
  { timestamps: true }
);

// Index pour la recherche
productSchema.index({ name: 1, brand: 1 });

// Middleware pre-save pour calculer automatiquement les prix HT et TVA
productSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    // Arrondir le prix TTC à 2 décimales
    this.price = PriceService.roundToTwo(this.price);
    
    // Calculer et arrondir les prix HT et TVA
    const { priceHT, taxAmount } = PriceService.extractTaxFromTTC(this.price);
    this.priceHT = priceHT;
    this.taxAmount = taxAmount;
  }
  next();
});

// Calcul de la moyenne des notes
productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = totalRating / this.reviews.length;
  this.numReviews = this.reviews.length;
};

// Propriété virtuelle pour le taux de TVA
productSchema.virtual('taxRate').get(function() {
  return PriceService.getCurrentTaxRate();
});

// Méthode pour obtenir les prix formatés
productSchema.methods.getFormattedPrice = function() {
  return {
    priceTTC: PriceService.formatPrice(this.price),
    priceHT: PriceService.formatPrice(this.priceHT),
    taxAmount: PriceService.formatPrice(this.taxAmount),
    taxRate: `${(this.taxRate * 100).toFixed(1)}%`
  };
};

// Middleware pre-save pour mettre à jour le rating avant de sauvegarder le produit
productSchema.pre("save", function (next) {
  this.calculateRating();
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
