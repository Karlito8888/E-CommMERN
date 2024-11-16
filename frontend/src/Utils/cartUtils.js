// frontend/src/Utils/cartUtils.js

/**
 * Utilitaires de calcul et de validation pour le panier
 */
export const CartCalculator = {
  /**
   * Arrondir un nombre à 2 décimales
   * @param {number} num - Nombre à arrondir
   * @returns {number} Nombre arrondi
   */
  addDecimals(num) {
    if (typeof num !== 'number') return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
  },

  /**
   * Calculer le prix total des articles
   * @param {Array} items - Articles du panier
   * @returns {number} Prix total des articles
   */
  calculateItemsPrice(items) {
    if (!Array.isArray(items)) return 0;
    return this.addDecimals(
      items.reduce((sum, item) => {
        const price = parseFloat(item?.price) || 0;
        const quantity = parseInt(item?.quantity) || 0;
        return sum + price * quantity;
      }, 0)
    );
  },

  /**
   * Calculer les frais de livraison
   * @param {number} itemsPrice - Prix total des articles
   * @returns {number} Frais de livraison
   */
  calculateShippingPrice(itemsPrice) {
    const price = parseFloat(itemsPrice) || 0;
    return this.addDecimals(price > 100 ? 0 : 10);
  },

  /**
   * Calculer la TVA (20%)
   * @param {number} itemsPrice - Prix total des articles
   * @returns {number} Montant de la TVA
   */
  calculateTaxPrice(itemsPrice) {
    const price = parseFloat(itemsPrice) || 0;
    return this.addDecimals(0.20 * price);
  },

  /**
   * Calculer tous les totaux du panier
   * @param {Array} cartItems - Articles du panier
   * @returns {Object} Totaux du panier
   */
  calculateTotals(cartItems = []) {
    if (!Array.isArray(cartItems)) return this.getEmptyTotals();

    const itemsPrice = this.calculateItemsPrice(cartItems);
    const shippingPrice = this.calculateShippingPrice(itemsPrice);
    const taxPrice = this.calculateTaxPrice(itemsPrice);
    const totalPrice = this.addDecimals(itemsPrice + shippingPrice + taxPrice);

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    };
  },

  /**
   * Obtenir un objet totaux vide
   * @returns {Object} Totaux à zéro
   */
  getEmptyTotals() {
    return {
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0
    };
  },

  /**
   * Formater un article pour l'API
   * @param {Object} item - Article du panier
   * @throws {Error} Si l'article est invalide
   * @returns {Object} Article formaté pour l'API
   */
  formatCartItemForApi(item) {
    if (!this.validateCartItem(item)) {
      throw new Error('Article invalide pour l\'API');
    }

    return {
      product: item.product,
      quantity: parseInt(item.quantity, 10)
    };
  },

  /**
   * Formater un article depuis l'API
   * @param {Object} item - Article de l'API
   * @throws {Error} Si l'article est invalide
   * @returns {Object} Article formaté pour le frontend
   */
  formatCartItemFromApi(item) {
    if (!item?.product?._id) {
      throw new Error('Article invalide depuis l\'API');
    }

    return {
      product: item.product._id,
      name: item.product.name || 'Article inconnu',
      image: item.product.image || '',
      price: this.addDecimals(parseFloat(item.product.price) || 0),
      countInStock: parseInt(item.product.countInStock, 10) || 0,
      quantity: parseInt(item.quantity, 10) || 0
    };
  },

  /**
   * Valider un article du panier
   * @param {Object} item - Article à valider
   * @returns {boolean} True si l'article est valide
   */
  validateCartItem(item) {
    if (!item || typeof item !== 'object') return false;

    const quantity = parseInt(item.quantity, 10);
    const countInStock = parseInt(item.countInStock, 10) || Infinity;

    return (
      item.product && // ID produit existe
      typeof item.product === 'string' && // ID est une chaîne
      !isNaN(quantity) && // Quantité est un nombre
      quantity > 0 && // Quantité positive
      quantity <= countInStock // Ne dépasse pas le stock
    );
  },

  /**
   * Préparer le panier pour le stockage local
   * @param {Array} items - Articles du panier
   * @returns {Array} Articles préparés pour le stockage
   */
  prepareCartForStorage(items = []) {
    if (!Array.isArray(items)) return [];

    return items
      .filter(item => this.validateCartItem(item))
      .map(item => ({
        product: item.product,
        name: item.name || 'Article inconnu',
        image: item.image || '',
        price: this.addDecimals(parseFloat(item.price) || 0),
        countInStock: parseInt(item.countInStock, 10) || 0,
        quantity: parseInt(item.quantity, 10) || 0
      }));
  }
};

export default CartCalculator;
