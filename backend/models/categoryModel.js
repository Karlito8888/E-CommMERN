// backend/models/categoryModel.js

import mongoose from "mongoose";
import { APIError } from "../middlewares/errorMiddleware.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Le nom de la catégorie est requis"],
      minLength: [2, "Le nom de la catégorie doit contenir au moins 2 caractères"],
      maxLength: [32, "Le nom de la catégorie ne doit pas dépasser 32 caractères"],
      unique: true,
      validate: {
        validator: function(v) {
          return /^[a-zA-ZÀ-ÿ0-9\s-]+$/.test(v);
        },
        message: "Le nom de la catégorie ne peut contenir que des lettres, chiffres, espaces et tirets"
      }
    },
    slug: {
      type: String,
      unique: true,
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour la recherche rapide par nom
categorySchema.index({ name: 1 });

// Middleware pre-save pour générer le slug
categorySchema.pre('save', function(next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  next();
});

// Virtuals pour les produits associés (à implémenter quand le modèle Product sera créé)
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Méthode statique pour vérifier si une catégorie existe
categorySchema.statics.exists = async function(name) {
  return await this.findOne({ name });
};

export default mongoose.model("Category", categorySchema);
