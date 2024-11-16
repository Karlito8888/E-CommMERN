// backend/controllers/productController.js

import asyncHandler from '../middlewares/asyncHandler.js';
import { ProductService } from '../services/productService.js';
import { ValidationService } from '../services/validationService.js';
import logger from '../utils/logger.js';
import { APIError } from '../middlewares/errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

const logProductAction = (action, productId, userId = null) => {
  const logData = { productId, action };
  if (userId) logData.userId = userId;
  logger.info(`Product ${action}`, logData);
};

// Ajouter un produit
const addProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.create(req.body, req.file);
  logProductAction('created', product._id, req.user?._id);
  res.status(201).json({ success: true, data: product });
});

// Mettre à jour un produit
const updateProductDetails = asyncHandler(async (req, res) => {
  const product = await ProductService.update(req.params.id, req.body, req.file);
  if (!product) {
    throw new APIError(ERROR_MESSAGES.PRODUCT.NOT_FOUND('Produit'), 404);
  }
  logProductAction('updated', product._id, req.user?._id);
  res.status(200).json({ success: true, data: product });
});

// Supprimer un produit
const removeProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.delete(req.params.id);
  if (!product) {
    throw new APIError(ERROR_MESSAGES.PRODUCT.NOT_FOUND('Produit'), 404);
  }
  logProductAction('deleted', req.params.id, req.user?._id);
  res.status(200).json({ 
    success: true, 
    message: ERROR_MESSAGES.PRODUCT.DELETED_SUCCESS
  });
});

// Récupérer les produits avec filtres
const fetchProducts = asyncHandler(async (req, res) => {
  try {
    // Valider les paramètres de recherche
    ValidationService.validateSearchParams(req.query);
    const { page, limit } = ValidationService.validatePagination(req.query.page, req.query.limit);
    
    const result = await ProductService.search({ ...req.query, page, limit });
    logger.debug('Products fetched', { 
      filters: req.query,
      count: result.data.length,
      page,
      limit
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new APIError(ERROR_MESSAGES.VALIDATION.INVALID_DATA, 400, error.details);
    }
    throw error;
  }
});

// Récupérer un produit par ID
const fetchProductById = asyncHandler(async (req, res) => {
  const product = await ProductService.findById(req.params.id);
  if (!product) {
    throw new APIError(ERROR_MESSAGES.PRODUCT.NOT_FOUND('Produit'), 404);
  }
  logger.debug('Product fetched by ID', { productId: req.params.id });
  res.status(200).json({
    success: true,
    data: product
  });
});

// Mettre à jour le stock d'un produit
const updateProductStock = asyncHandler(async (req, res) => {
  const product = await ProductService.updateStock(req.params.id, req.body.quantity);
  if (!product) {
    throw new APIError(ERROR_MESSAGES.PRODUCT.NOT_FOUND('Produit'), 404);
  }
  logProductAction('stock updated', product._id, req.user?._id);
  res.status(200).json({
    success: true,
    data: product
  });
});

// Récupérer les produits les mieux notés
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await ProductService.getTopRatedProducts();
  logger.debug('Top rated products fetched', { count: products.length });
  res.status(200).json({
    success: true,
    data: products
  });
});

// Récupérer toutes les marques uniques
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await ProductService.getAllBrands();
  logger.debug('All brands fetched', { count: brands.length });
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
