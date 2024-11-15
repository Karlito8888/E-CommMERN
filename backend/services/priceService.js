// backend/services/priceService.js

class PriceService {
  static TAX_RATE = 0.2; // 20% TVA
  static FREE_SHIPPING_THRESHOLD = 100; // Livraison gratuite au-dessus de 100€
  static SHIPPING_COST = 10; // Coût de livraison standard

  /**
   * Arrondit un nombre à 2 décimales
   * @param {number} number - Nombre à arrondir
   * @returns {number} Nombre arrondi à 2 décimales
   */
  static roundToTwo(number) {
    return Number(Math.round(number * 100) / 100);
  }

  /**
   * Calcule tous les prix pour une commande
   * @param {Array} orderItems - Articles de la commande
   * @returns {Object} Prix calculés
   */
  static calculateOrderPrices(orderItems) {
    const totalTTC = this.calculateItemsTotal(orderItems);
    const shippingPrice = this.calculateShippingCost(totalTTC);
    const { priceHT, taxAmount } = this.extractTaxFromTTC(totalTTC);

    return {
      itemsPrice: this.roundToTwo(priceHT),
      shippingPrice: this.roundToTwo(shippingPrice),
      taxPrice: this.roundToTwo(taxAmount),
      taxRate: this.TAX_RATE,
      totalPrice: this.roundToTwo(totalTTC + shippingPrice)
    };
  }

  /**
   * Calcule le total TTC des articles
   * @param {Array} items - Articles
   * @returns {number} Total TTC
   */
  static calculateItemsTotal(items) {
    const total = items.reduce((total, item) => total + (item.price * item.qty), 0);
    return this.roundToTwo(total);
  }

  /**
   * Extrait la TVA d'un montant TTC
   * @param {number} priceTTC - Prix TTC
   * @returns {Object} Prix HT et montant de la TVA
   */
  static extractTaxFromTTC(priceTTC) {
    const priceHT = this.roundToTwo(priceTTC / (1 + this.TAX_RATE));
    const taxAmount = this.roundToTwo(priceTTC - priceHT);
    return { priceHT, taxAmount };
  }

  /**
   * Calcule les frais de livraison
   * @param {number} totalTTC - Total TTC des articles
   * @returns {number} Frais de livraison
   */
  static calculateShippingCost(totalTTC) {
    return totalTTC > this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
  }

  /**
   * Applique une réduction sur un prix TTC
   * @param {number} priceTTC - Prix TTC original
   * @param {number} discountPercentage - Pourcentage de réduction
   * @returns {number} Prix TTC après réduction
   */
  static applyDiscount(priceTTC, discountPercentage) {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      return priceTTC;
    }
    return this.roundToTwo(priceTTC * (1 - discountPercentage / 100));
  }

  /**
   * Formate un prix en euros
   * @param {number} price - Prix à formater
   * @returns {string} Prix formaté
   */
  static formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Retourne le taux de TVA actuel
   * @returns {number} Taux de TVA
   */
  static getCurrentTaxRate() {
    return this.TAX_RATE;
  }
}

export default PriceService;
