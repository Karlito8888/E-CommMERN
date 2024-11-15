// backend/controllers/productController.js

import asyncHandler from '../middlewares/asyncHandler.js';
import { ProductService } from '../services/productService.js';
import { ValidationService } from '../services/validationService.js';
import logger from '../utils/logger.js';

// Ajouter un produit
const addProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.create(req.body, req.file);
  res.status(201).json({ success: true, data: product });
});

// Mettre à jour un produit
const updateProductDetails = asyncHandler(async (req, res) => {
  const product = await ProductService.update(req.params.id, req.body, req.file);
  res.status(200).json({ success: true, data: product });
});

// Supprimer un produit
const removeProduct = asyncHandler(async (req, res) => {
  await ProductService.delete(req.params.id);
  res.status(200).json({ 
    success: true, 
    message: 'Produit supprimé avec succès'
  });
});

// Récupérer les produits avec filtres
const fetchProducts = asyncHandler(async (req, res) => {
  // Valider les paramètres de recherche
  ValidationService.validateSearchParams(req.query);
  const { page, limit } = ValidationService.validatePagination(req.query.page, req.query.limit);
  
  const result = await ProductService.search({ ...req.query, page, limit });
  res.status(200).json({
    success: true,
    data: result
  });
});

// Récupérer un produit par ID
const fetchProductById = asyncHandler(async (req, res) => {
  const product = await ProductService.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: product
  });
});

// Mettre à jour le stock d'un produit
const updateProductStock = asyncHandler(async (req, res) => {
  const product = await ProductService.updateStock(req.params.id, req.body.quantity);
  res.status(200).json({
    success: true,
    data: product
  });
});

// Récupérer les produits les mieux notés
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await ProductService.getTopRatedProducts();
  res.status(200).json({
    success: true,
    data: products
  });
});

// Récupérer toutes les marques uniques
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await ProductService.getAllBrands();
  res.status(200).json({
    success: true,
    data: brands
  });
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  updateProductStock,
  getTopProducts,
  getAllBrands
};
