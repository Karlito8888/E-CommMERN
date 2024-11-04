import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";

// Fonction de validation des champs produit
function validateProductFields(fields) {
  if (!fields.name) return "Name is required";
  if (!fields.brand) return "Brand is required";
  if (!fields.description) return "Description is required";
  if (!fields.price || isNaN(fields.price) || fields.price <= 0)
    return "Valid price is required";
  if (!fields.category) return "Category is required";
  if (!fields.quantity) return "Quantity is required";
  return null;
}

// Ajouter un produit
const addProduct = asyncHandler(async (req, res) => {
  const error = validateProductFields(req.body);
  if (error) return res.status(400).json({ success: false, error });

  const productData = { ...req.body };
  if (req.file) productData.image = `/uploads/${req.file.filename}`;

  const product = new Product(productData);

  await product.save();
  res.status(201).json({ success: true, data: product });
});

// Mettre à jour un produit
const updateProductDetails = asyncHandler(async (req, res) => {
  const error = validateProductFields(req.body);
  if (error) return res.status(400).json({ success: false, error });

  const productData = { ...req.body };
  if (req.file) productData.image = `/uploads/${req.file.filename}`;

  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ success: false, error: "Product not found" });

  // Mettre à jour les champs du produit
  Object.assign(product, productData);

  await product.save();
  res.status(200).json({ success: true, data: product });
});

// Supprimer un produit
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ success: false, error: "Product not found" });

  if (product.image && product.image.startsWith("/uploads")) {
    const imagePath = path.join(process.cwd(), product.image);
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (!err)
        fs.unlink(
          imagePath,
          (err) => err && console.error("Failed to delete image:", err)
        );
    });
  }

  await product.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Product removed successfully" });
});

// Récupérer les produits
const fetchProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const products = await Product.find({ ...keyword })
    .populate("category")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    products,
  });
});

// Récupérer un produit par ID
const fetchProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ success: false, error: "Product not found" });
  res.status(200).json({ success: true, data: product });
});

// Ajouter un avis produit
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ success: false, error: "Product not found" });

  const alreadyReviewed = product.reviews.some(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed)
    return res
      .status(400)
      .json({ success: false, error: "Product already reviewed" });

  product.reviews.push({
    name: req.user.username,
    rating: Number(rating),
    comment,
    user: req.user._id,
  });
  product.calculateRating();

  await product.save();
  res.status(201).json({ success: true, message: "Review added" });
});

// Récupérer les meilleurs produits
const fetchTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);
  res.status(200).json({ success: true, data: products });
});

// Récupérer les nouveaux produits
const fetchNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ _id: -1 }).limit(5);
  res.status(200).json({ success: true, data: products });
});

// Filtrer les produits
const filterProducts = asyncHandler(async (req, res) => {
  const { checked, radio } = req.body;
  let args = {};
  if (checked && checked.length > 0) args.category = checked;
  if (radio && radio.length === 2)
    args.price = { $gte: radio[0], $lte: radio[1] };

  const products = await Product.find(args);
  res.status(200).json({ success: true, data: products });
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};
