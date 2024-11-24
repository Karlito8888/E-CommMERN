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
    name: {
      type: String,
      required: true
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
      maxlength: 1000
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    priceAfterTax: {
      type: Number,
      required: true,
      default: 0
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes optimisés
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Middleware pre-save pour calculer le prix après taxes
productSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    this.priceAfterTax = this.price * (1 + TAX_RATE);
  }
  next();
});

// Méthode pour mettre à jour la note moyenne
productSchema.methods.updateRating = function() {
  const reviews = this.reviews;
  if (reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating = Math.round((reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length) * 10) / 10;
    this.numReviews = reviews.length;
  }
};

export default mongoose.model("Product", productSchema);
