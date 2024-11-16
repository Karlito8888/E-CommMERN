// backend/models/categoryModel.js

import mongoose from "mongoose";
import { APIError } from "../middlewares/errorMiddleware.js";
import { ERROR_MESSAGES } from "../utils/errorMessages.js";
import logger from "../utils/logger.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, ERROR_MESSAGES.CATEGORY.NAME.REQUIRED],
      minLength: [2, ERROR_MESSAGES.CATEGORY.NAME.TOO_SHORT],
      maxLength: [32, ERROR_MESSAGES.CATEGORY.NAME.TOO_LONG],
      unique: true,
      validate: {
        validator: function(v) {
          return /^[a-zA-ZÀ-ÿ0-9\s-]+$/.test(v);
        },
        message: ERROR_MESSAGES.CATEGORY.NAME.INVALID_FORMAT
      }
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxLength: [200, ERROR_MESSAGES.CATEGORY.DESCRIPTION.TOO_LONG]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour la recherche rapide par nom et slug
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

// Middleware pre-save pour générer le slug et logger
categorySchema.pre('save', async function(next) {
  try {
    // Générer le slug
    if (this.isModified('name')) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Vérifier l'unicité du slug
      const existingCategory = await this.constructor.findOne({ 
        slug: this.slug,
        _id: { $ne: this._id }
      });
      
      if (existingCategory) {
        throw new APIError(ERROR_MESSAGES.CATEGORY.ALREADY_EXISTS, 409);
      }
    }

    // Logger la création/modification
    const action = this.isNew ? 'created' : 'updated';
    logger.info(`Category ${action}`, { 
      categoryId: this._id,
      name: this.name,
      slug: this.slug
    });

    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pre-remove pour vérifier les dépendances
categorySchema.pre('remove', async function(next) {
  try {
    // Vérifier si des produits utilisent cette catégorie
    const productCount = await mongoose.model('Product').countDocuments({ category: this._id });
    if (productCount > 0) {
      throw new APIError(ERROR_MESSAGES.CATEGORY.HAS_PRODUCTS, 409);
    }

    logger.info('Category deleted', { categoryId: this._id, name: this.name });
    next();
  } catch (error) {
    next(error);
  }
});

// Virtuals pour les produits associés
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  options: { sort: { createdAt: -1 } }
});

// Méthodes statiques
categorySchema.statics = {
  async exists(name) {
    return await this.findOne({ name });
  },

  async findBySlug(slug) {
    const category = await this.findOne({ slug });
    if (!category) {
      throw new APIError(ERROR_MESSAGES.CATEGORY.NOT_FOUND, 404);
    }
    return category;
  },

  async getActiveCategories() {
    return await this.find({ isActive: true }).sort('name');
  }
};

// Méthodes d'instance
categorySchema.methods = {
  async toggleActive() {
    this.isActive = !this.isActive;
    await this.save();
    return this;
  },

  async getProductCount() {
    return await mongoose.model('Product').countDocuments({ category: this._id });
  }
};

export default mongoose.model("Category", categorySchema);
