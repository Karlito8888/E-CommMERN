// backend/controllers/productController.js

import Product from '../models/productModel.js';
import { asyncHandler } from '../core/index.js';

const PRODUCT_FIELDS = 'name price description image thumbnail brand category stock rating numReviews';
const CACHE_TTL = 300; // 5 minutes

const formatProduct = product => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  description: product.description,
  image: product.image,
  thumbnail: product.thumbnail,
  brand: product.brand,
  category: product.category,
  stock: product.stock,
  rating: product.rating,
  numReviews: product.numReviews
});

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const sort = { [req.query.sort || 'createdAt']: req.query.order === 'asc' ? 1 : -1 };

  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.minPrice) query.price = { $gte: parseFloat(req.query.minPrice) };
  if (req.query.maxPrice) query.price = { ...query.price, $lte: parseFloat(req.query.maxPrice) };
  if (req.query.brand) query.brand = req.query.brand;
  if (req.query.inStock) query.stock = { $gt: 0 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .select(PRODUCT_FIELDS)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .cache(CACHE_TTL),
    Product.countDocuments(query).cache(CACHE_TTL)
  ]);

  res.json({
    products: products.map(formatProduct),
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) {
    return res.status(400).json({ message: 'Terme de recherche requis' });
  }

  const products = await Product.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .select(PRODUCT_FIELDS)
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean()
    .cache(CACHE_TTL);

  res.json(products.map(formatProduct));
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .select(PRODUCT_FIELDS)
    .populate('category', 'name')
    .lean()
    .cache(CACHE_TTL);

  if (!product) {
    return res.status(404).json({ message: 'Produit introuvable' });
  }

  res.json(formatProduct(product));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    category: req.params.categoryId,
    stock: { $gt: 0 }
  })
    .select(PRODUCT_FIELDS)
    .sort('-rating')
    .lean()
    .cache(CACHE_TTL);

  res.json(products.map(formatProduct));
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    rating: { $gte: 4 },
    stock: { $gt: 0 }
  })
    .select(PRODUCT_FIELDS)
    .sort('-rating -numReviews')
    .limit(4)
    .lean()
    .cache(CACHE_TTL);

  res.json(products.map(formatProduct));
});

const getTopRatedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 3;

  const products = await Product.find({})
    .sort({ rating: -1 })
    .limit(limit)
    .lean();

  res.json(products);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, brand, category, stock } = req.body;

  if (!name?.trim() || !price || !category) {
    return res.status(400).json({ 
      message: 'Nom, prix et catégorie requis' 
    });
  }

  if (!req.processedImage) {
    return res.status(400).json({ 
      message: 'Image requise' 
    });
  }

  const product = await Product.create({
    name,
    price,
    description,
    image: req.processedImage.main,
    thumbnail: req.processedImage.thumbnail,
    brand,
    category,
    stock: stock || 0
  });

  res.status(201).json(formatProduct(product));
});

const updateProduct = asyncHandler(async (req, res) => {
  const updates = {};
  const fields = ['name', 'price', 'description', 'brand', 'category', 'stock'];
  
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (req.processedImage) {
    updates.image = req.processedImage.main;
    updates.thumbnail = req.processedImage.thumbnail;
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).lean();

  if (!product) {
    return res.status(404).json({ message: 'Produit introuvable' });
  }

  res.json(formatProduct(product));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id).lean();

  if (!product) {
    return res.status(404).json({ message: 'Produit introuvable' });
  }

  res.json({ 
    message: 'Produit supprimé',
    _id: product._id 
  });
});

export {
  getProducts,
  searchProducts,
  getProduct,
  getProductsByCategory,
  getTopProducts,
  getTopRatedProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
