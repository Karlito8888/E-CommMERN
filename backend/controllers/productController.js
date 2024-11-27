// backend/controllers/productController.js

import Product from "../models/productModel.js";
import { asyncHandler } from "../core/index.js";

const PRODUCT_FIELDS =
  "name price description image thumbnail brand category countInStock rating numReviews reviews";

const formatProduct = (product) => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  description: product.description,
  image: product.image,
  thumbnail: product.thumbnail,
  brand: product.brand,
  category: {
    _id: product.category._id,
    name: product.category.name,
  },
  countInStock: product.countInStock,
  rating: product.rating,
  numReviews: product.numReviews,
  reviews: product.reviews || [],
});

const getProducts = asyncHandler(async (req, res) => {
  const sort = {
    [req.query.sort || "createdAt"]: req.query.order === "asc" ? 1 : -1,
  };

  const query = {};
  if (req.query.category) query["category._id"] = req.query.category;
  if (req.query.minPrice)
    query.price = { $gte: parseFloat(req.query.minPrice) };
  if (req.query.maxPrice)
    query.price = { ...query.price, $lte: parseFloat(req.query.maxPrice) };
  if (req.query.brand) query.brand = req.query.brand;
  if (req.query.inStock) query.countInStock = { $gt: 0 };

  const products = await Product.find(query)
    .select(PRODUCT_FIELDS)
    .sort(sort)
    .lean();

  res.json({
    products: products.map(formatProduct),
    total: products.length,
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) {
    return res.status(400).json({ message: "Terme de recherche requis" });
  }

  const products = await Product.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .select(PRODUCT_FIELDS)
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .lean();

  res.json(products.map(formatProduct));
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .select(PRODUCT_FIELDS)
    .lean();

  if (!product) {
    return res.status(404).json({ message: "Produit introuvable" });
  }

  res.json(formatProduct(product));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({
    "category._id": req.params.categoryId,
    countInStock: { $gt: 0 },
  })
    .select(PRODUCT_FIELDS)
    .sort("-rating")
    .lean();

  res.json(products.map(formatProduct));
});

const getTopRatedProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 3, 10);

  const products = await Product.find()
    .select(PRODUCT_FIELDS)
    .sort({ rating: -1 })
    .limit(limit)
    .lean();

  res.json(products.map(formatProduct));
});

const getFilteredProducts = asyncHandler(async (req, res) => {
  const {
    categories,
    brands,
    priceRange,
    rating,
    page = 1,
    limit = 12,
  } = req.body;

  const query = {};

  if (categories?.length) {
    query["category._id"] = { $in: categories };
  }

  if (brands?.length) {
    query.brand = { $in: brands };
  }

  if (priceRange) {
    query.price = {
      $gte: priceRange[0] || 0,
      $lte: priceRange[1] || Number.MAX_VALUE,
    };
  }

  if (rating) {
    query.rating = { $gte: rating };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .select(PRODUCT_FIELDS)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    products: products.map(formatProduct),
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct("brand");
  res.json(brands.sort());
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, brand, category, countInStock } = req.body;

  if (!name?.trim() || !price || !category?._id || !category?.name) {
    return res.status(400).json({
      message: "Nom, prix, catégorie (id et nom) requis",
    });
  }

  if (!req.processedImage) {
    return res.status(400).json({
      message: "Image requise",
    });
  }

  const product = await Product.create({
    name,
    price,
    description,
    image: req.processedImage.main,
    thumbnail: req.processedImage.thumbnail,
    brand,
    category: {
      _id: category._id,
      name: category.name,
    },
    countInStock: countInStock || 0,
  });

  res.status(201).json(formatProduct(product));
});

const updateProduct = asyncHandler(async (req, res) => {
  const updates = {};
  const fields = [
    "name",
    "price",
    "description",
    "brand",
    "category",
    "countInStock",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (req.processedImage) {
    updates.image = req.processedImage.main;
    updates.thumbnail = req.processedImage.thumbnail;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!product) {
    return res.status(404).json({ message: "Produit introuvable" });
  }

  res.json(formatProduct(product));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id).lean();

  if (!product) {
    return res.status(404).json({ message: "Produit introuvable" });
  }

  res.json({
    message: "Produit supprimé",
    _id: product._id,
  });
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // Validation des données
  if (!rating || !comment) {
    return res
      .status(400)
      .json({ message: "La note et le commentaire sont requis" });
  }

  if (rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 1 et 5" });
  }

  if (comment.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Le commentaire doit contenir au moins 3 caractères" });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Produit introuvable" });
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: "Produit déjà évalué" });
  }

  const review = {
    name: req.user.username,
    rating: Number(rating),
    comment: comment.trim(),
    user: req.user._id,
  };

  product.reviews.push(review);
  product.updateRating();

  await product.save();
  res.status(201).json({ message: "Avis ajouté" });
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId, categoryId, limit = 4 } = req.query;

  // Récupérer le produit de référence pour la comparaison
  const referenceProduct = await Product.findById(productId).lean();

  if (!referenceProduct) {
    return res
      .status(404)
      .json({ message: "Produit de référence introuvable" });
  }

  // Trouver des produits similaires
  const products = await Product.find({
    "category._id": categoryId,
    _id: { $ne: productId },
    countInStock: { $gt: 0 },
    // Filtrer les produits dans une gamme de prix similaire (±50%)
    price: {
      $gte: referenceProduct.price * 0.5,
      $lte: referenceProduct.price * 1.5,
    },
  })
    .select(PRODUCT_FIELDS)
    .sort({
      rating: -1, // D'abord par note
      numReviews: -1, // Puis par nombre d'avis
      price: 1, // Enfin par prix croissant
    })
    .limit(parseInt(limit))
    .lean();

  res.json(products.map(formatProduct));
});

export {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getTopRatedProducts,
  getFilteredProducts,
  getAllBrands,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getRelatedProducts,
};
