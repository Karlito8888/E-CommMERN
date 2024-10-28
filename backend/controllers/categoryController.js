import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    return res.status(400).json({ error: "Category already exists" });
  }

  const category = await new Category({ name }).save();
  return res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  category.name = name;
  const updatedCategory = await category.save();
  return res.status(200).json({ success: true, data: updatedCategory });
});

const removeCategory = asyncHandler(async (req, res) => {
  const removed = await Category.findByIdAndDelete(req.params.categoryId);

  if (!removed) {
    return res.status(404).json({ error: "Category not found" });
  }

  return res.status(200).json({ success: true, data: removed });
});

const listCategory = asyncHandler(async (req, res) => {
  const all = await Category.find({});
  return res.status(200).json({ success: true, data: all });
});

const readCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  return res.status(200).json({ success: true, data: category });
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
};
