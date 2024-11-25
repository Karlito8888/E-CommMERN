// backend/controllers/categoryController.js

import Category from "../models/categoryModel.js";
import { asyncHandler } from "../core/index.js";

// Format de réponse standard pour les catégories
const formatCategory = cat => ({
  _id: cat._id,
  name: cat.name
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

  const category = await Category.create({ name });
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
    { name },
    { new: true }
  ).lean();

  if (!category) {
    return res.status(404).json({ message: "Catégorie introuvable" });
  }

  res.json(formatCategory(category));
});

// Obtenir toutes les catégories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .sort('name')
    .lean();

  res.json(categories.map(formatCategory));
});

// Obtenir une catégorie par ID
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId).lean();
  
  if (!category) {
    return res.status(404).json({ message: "Catégorie introuvable" });
  }

  res.json(formatCategory(category));
});

// Supprimer une catégorie
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.categoryId);
  
  if (!category) {
    return res.status(404).json({ message: "Catégorie introuvable" });
  }

  res.json({ message: "Catégorie supprimée avec succès" });
});

export {
  createCategory,
  updateCategory,
  getCategories,
  getCategoryById,
  deleteCategory
};
