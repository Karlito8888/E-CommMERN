import crypto from 'crypto';
import logger from './logger.js';
import Product from '../models/productModel.js';

// Gestion détaillée des erreurs Stripe
export const handleStripeError = (error) => {
  logger.error('Stripe error occurred', { 
    type: error.type,
    message: error.message,
    code: error.code 
  });

  switch (error.type) {
    case 'StripeCardError':
      return { 
        status: 400, 
        message: 'Votre carte a été refusée. Veuillez vérifier vos informations de paiement.' 
      };
    case 'StripeRateLimitError':
      return { 
        status: 429, 
        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' 
      };
    case 'StripeInvalidRequestError':
      return { 
        status: 400, 
        message: 'Les informations fournies sont invalides.' 
      };
    case 'StripeAPIError':
      return { 
        status: 500, 
        message: 'Une erreur est survenue avec notre système de paiement.' 
      };
    case 'StripeConnectionError':
      return { 
        status: 503, 
        message: 'Impossible de se connecter au système de paiement. Veuillez réessayer.' 
      };
    default:
      return { 
        status: 500, 
        message: 'Une erreur inattendue est survenue. Veuillez réessayer.' 
      };
  }
};

// Validation des articles du panier
export const validateCartItems = async (cartItems) => {
  try {
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        throw new Error(`Produit non trouvé: ${item.name}`);
      }
      
      // Vérification du prix avec une tolérance de 1 centime pour les erreurs d'arrondi
      const priceDiff = Math.abs(item.price - product.price);
      if (priceDiff > 0.01) {
        throw new Error(`Prix incorrect pour: ${item.name}`);
      }
      
      if (item.qty > product.countInStock) {
        throw new Error(`Stock insuffisant pour: ${item.name}`);
      }
    }
    return true;
  } catch (error) {
    logger.error('Cart validation error', { error: error.message });
    throw error;
  }
};

// Génération de clé d'idempotence
export const generateIdempotencyKey = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Mise à jour du stock après paiement réussi
export const updateProductStock = async (cartItems) => {
  try {
    for (const item of cartItems) {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { countInStock: -item.qty }
      }, { new: true });
      
      logger.info('Stock updated', { 
        productId: item._id, 
        quantity: item.qty 
      });
    }
  } catch (error) {
    logger.error('Stock update error', { error: error.message });
    throw error;
  }
};

export default {
  handleStripeError,
  validateCartItems,
  generateIdempotencyKey,
  updateProductStock
};
