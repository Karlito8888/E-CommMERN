// backend/controllers/categoryController.js

import Category from "../models/categoryModel.js";
import { asyncHandler } from "../core/index.js";
import slugify from "slugify";

// Format de réponse standard pour les catégories
const formatCategory = cat => ({
  _id: cat._id,
  name: cat.name,
  slug: cat.slug,
  productsCount: cat.productsCount
});

// Créer une nouvelle catégorie
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Le nom est requis" });
  }

  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') } 
  }).lean();
  
  if (existingCategory) {
    return res.status(400).json({ message: "Cette catégorie existe déjà" });
  }

  const category = await Category.create({ 
    name,
    slug: slugify(name, { lower: true, strict: true })
  });

  res.status(201).json(formatCategory(category));
});

// Mettre à jour une catégorie
const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Le nom est requis" });
  }

  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    _id: { $ne: req.params.categoryId }
  }).lean();
  
  if (existingCategory) {
    return res.status(400).json({ message: "Cette catégorie existe déjà" });
  }

  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    { 
      name,
      slug: slugify(name, { lower: true, strict: true })
    },
    { new: true }
  ).lean();
  
  if (!category) {
    return res.status(404).json({ message: "Catégorie introuvable" });
  }
  
  res.json(formatCategory(category));
});

// Supprimer une catégorie
const removeCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId).lean();
  
  if (!category) {
    return res.status(404).json({ message: "Catégorie introuvable" });
  }

  if (category.productsCount > 0) {
    return res.status(400).json({ 
      message: "Impossible de supprimer une catégorie avec des produits" 
    });
  }
  
  await Category.deleteOne({ _id: req.params.categoryId });
  res.json({ message: "Catégorie supprimée", _id: category._id });
});

// Lister toutes les catégories
const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .select('name slug productsCount')
    .sort({ name: 1 })
    .lean()
    .cache(300); // Cache 5 minutes
    
  res.json(categories.map(formatCategory));
});

// Obtenir une catégorie par ID ou slug
const getCategory = asyncHandler(async (req, res) => {
  const query = req.params.categoryId ? 
    { _id: req.params.categoryId } : 
    { slug: req.params.slug };

  const category = await Category.findOne(query)
    .select('name slug productsCount')
    .lean()
    .cache(300);
  
  if (!category) {
    return res.status(404).json({ message: "Catégorie introuvable" });
  }
  
  res.json(formatCategory(category));
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategories,
  getCategory
};
