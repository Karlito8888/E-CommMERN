// backend/services/productService.js

import { APIError } from '../middlewares/errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import logger from '../utils/logger.js';
import Product from "../models/productModel.js";
import { FileService } from './fileService.js';
import { ValidationService } from './validationService.js';
import PriceService from './priceService.js';

export class ProductService {
  // Gestion des images
  static async handleImageUpload(file) {
    if (!file) return null;
    return `/uploads/${file.filename}`;
  }

  static async deleteImage(imagePath) {
    if (!imagePath || !imagePath.startsWith("/uploads")) return;

    const fullPath = path.join(process.cwd(), imagePath);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        logger.info('Image supprimée avec succès', { path: imagePath });
      }
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'image', { 
        path: imagePath,
        error: error.message 
      });
      throw new APIError('Erreur lors de la suppression de l\'image', 500);
    }
  }

  // Opérations CRUD
  static async findById(id) {
    const product = await Product.findById(id).populate('category');
    if (!product) {
      throw new APIError(ERROR_MESSAGES.RESOURCE.NOT_FOUND('Produit'), 404);
    }
    return product;
  }

  static async create(productData, file) {
    // Validation des données
    await ValidationService.validateProduct(productData);

    // Gestion de l'image
    if (file) {
      productData.image = await FileService.handleImageUpload(file);
    }

    // Initialisation du stock si une quantité initiale est fournie
    if (productData.quantity !== undefined) {
      productData.stock = productData.quantity;
      delete productData.quantity; // On ne garde pas la quantité initiale
    } else {
      productData.stock = 0;
    }

    // Gestion du prix TTC
    const { priceHT, taxAmount } = PriceService.extractTaxFromTTC(productData.price);
    productData.priceHT = priceHT;
    productData.taxAmount = taxAmount;

    const product = new Product(productData);
    await product.save();

    logger.info('Nouveau produit créé', { 
      productId: product._id,
      name: product.name,
      initialStock: product.stock
    });

    return product;
  }

  static async update(id, productData, file) {
    const product = await this.findById(id);
    
    // Validation des données
    await ValidationService.validateProduct(productData);

    // Gestion de l'image
    if (file) {
      if (product.image) {
        await FileService.deleteImage(product.image);
      }
      productData.image = await FileService.handleImageUpload(file);
    }

    // Gestion du prix TTC
    if (productData.price) {
      const { priceHT, taxAmount } = PriceService.extractTaxFromTTC(productData.price);
      productData.priceHT = priceHT;
      productData.taxAmount = taxAmount;
    }

    Object.assign(product, productData);
    await product.save();

    logger.info('Produit mis à jour', { 
      productId: product._id,
      updatedFields: Object.keys(productData)
    });

    return product;
  }

  static async delete(id) {
    const product = await this.findById(id);

    if (product.image) {
      await FileService.deleteImage(product.image);
    }

    await product.deleteOne();

    logger.info('Produit supprimé', { 
      productId: id,
      name: product.name 
    });

    return product;
  }

  // Recherche et filtrage
  static async search({ keyword, category, minPrice, maxPrice, sortBy, order, page = 1, limit = 8, checked, radio }) {
    const query = {};

    // Filtrage par mot-clé
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filtrage par catégorie
    if (checked && checked.length > 0) {
      query.category = { $in: checked };
    }

    // Filtrage par marque
    if (radio) {
      query.brand = radio;
    }

    // Filtrage par prix
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Préparation du tri
    const sortOptions = {};
    if (sortBy && order) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Par défaut, tri par date de création décroissante
    }

    // Exécution de la requête
    const products = await Product.find(query)
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Comptage total pour la pagination
    const total = await Product.countDocuments(query);

    return {
      products,
      total,
      currentPage: page,
      pages: Math.ceil(total / limit)
    };
  }

  // Gestion du stock
  static async updateStock(id, quantity) {
    const product = await this.findById(id);
    
    if ((product.stock + quantity) < 0) {
      throw new APIError('Le stock ne peut pas devenir négatif', 400);
    }

    product.stock += quantity;
    await product.save();

    logger.info('Stock du produit mis à jour', {
      productId: id,
      quantityAdded: quantity,
      newStock: product.stock
    });

    return product;
  }

  // Récupère les informations complètes d'un produit
  static async getProductDetails(id) {
    try {
      const product = await this.findById(id);
      const { priceHT, taxAmount } = PriceService.extractTaxFromTTC(product.price);
      
      return {
        ...product.toObject(),
        priceDetails: {
          priceTTC: product.price,
          priceHT: priceHT,
          taxAmount: taxAmount,
          taxRate: PriceService.getCurrentTaxRate()
        }
      };
    } catch (error) {
      logger.error(`Erreur lors de la récupération des détails du produit: ${error.message}`);
      throw error;
    }
  }

  // Applique une réduction sur le prix TTC d'un produit
  static async applyDiscount(id, discountPercentage) {
    try {
      const product = await this.findById(id);
      const newPriceTTC = PriceService.applyDiscount(product.price, discountPercentage);
      product.price = newPriceTTC;
      
      const updatedProduct = await product.save();
      logger.info(`Réduction de ${discountPercentage}% appliquée au produit ${id}`);
      
      return updatedProduct;
    } catch (error) {
      logger.error(`Erreur lors de l'application de la réduction: ${error.message}`);
      throw error;
    }
  }

  // Récupérer les produits les mieux notés
  static async getTopRatedProducts(limit = 3) {
    try {
      const products = await Product.find({})
        .sort({ rating: -1, numReviews: -1 })
        .limit(limit);

      if (!products.length) {
        logger.info('Aucun produit trouvé');
        return [];
      }

      return products;
    } catch (error) {
      logger.error('Erreur lors de la récupération des produits les mieux notés', {
        error: error.message
      });
      throw new APIError('Erreur lors de la récupération des produits les mieux notés', 500);
    }
  }

  // Récupérer toutes les marques uniques
  static async getAllBrands() {
    const brands = await Product.distinct('brand');
    return brands.filter(Boolean).sort(); // Filtrer les valeurs null/undefined et trier
  }
}
