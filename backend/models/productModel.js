// backend/models/productModel.js

import mongoose from "mongoose";
import { TAX_RATE } from "../core/index.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    image: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    priceHT: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    reviews: [reviewSchema],
    stripeProductId: {
      type: String,
      required: true,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes optimisés
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });

// Calcul automatique des prix et taxes
productSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    this.priceHT = +(this.price / (1 + TAX_RATE)).toFixed(2);
    this.taxAmount = +(this.price - this.priceHT).toFixed(2);
  }
  next();
});

// Mise à jour de la note moyenne
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = +(totalRating / this.reviews.length).toFixed(1);
  this.numReviews = this.reviews.length;
};

export default mongoose.model("Product", productSchema);
