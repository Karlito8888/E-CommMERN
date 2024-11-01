// backend/controllers/categoryController.js

import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Le nom est requis" });
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({ error: "La catégorie existe déjà" });
  }

  const category = await new Category({ name }).save();
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ error: "Catégorie introuvable" });
  }

  const duplicateCategory = await Category.findOne({ name });
  if (duplicateCategory && duplicateCategory._id.toString() !== categoryId) {
    return res.status(400).json({ error: "Ce nom de catégorie existe déjà" });
  }

  category.name = name;
  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

const removeCategory = asyncHandler(async (req, res) => {
  const removed = await Category.findByIdAndDelete(req.params.categoryId);
  if (!removed) {
    return res.status(404).json({ error: "Catégorie introuvable" });
  }
  res.status(200).json({ message: "Catégorie supprimée avec succès" });
});

const listCategory = asyncHandler(async (req, res) => {
  const all = await Category.find({});
  res.status(200).json(all);
});

const readCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ error: "Catégorie introuvable" });
  }
  res.status(200).json(category);
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
};

