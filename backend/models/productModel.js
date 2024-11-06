// backend/models/productModel.js

import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 5, maxlength: 500 },
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
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    image: { type: String, required: true },
    brand: { type: String, required: true, minlength: 2, maxlength: 100 },
    quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, required: true, default: "EUR" },
    stock: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Ajout d'un index pour une recherche plus rapide
productSchema.index({ name: 1, brand: 1 });

// Méthode pour calculer la moyenne des notes
productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.rating = totalRating / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// Middleware pre-save pour mettre à jour le rating avant de sauvegarder le produit
productSchema.pre("save", function (next) {
  if (this.isNew) {
    this.stock = this.quantity;
  } else {
    this.stock += this.quantity;
  }

  this.calculateRating();
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
