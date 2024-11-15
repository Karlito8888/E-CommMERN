// backend/services/cartService.js

export class CartService {
    // Initialiser un nouveau panier
    static initializeCart() {
        return {
            items: [],
            totalPrice: 0,
            totalItems: 0,
            updatedAt: new Date()
        };
    }

    // Mettre à jour les totaux du panier
    static updateCartTotals(cart) {
        cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        cart.updatedAt = new Date();
        return cart;
    }

    // Ajouter ou mettre à jour un produit dans le panier
    static addItem(cart, { productId, name, price, quantity, image }) {
        const existingItemIndex = cart.items.findIndex(
            item => item.productId === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                name,
                price,
                quantity,
                image,
                addedAt: new Date()
            });
        }

        return this.updateCartTotals(cart);
    }

    // Retirer un produit du panier
    static removeItem(cart, productId) {
        cart.items = cart.items.filter(item => item.productId !== productId);
        return this.updateCartTotals(cart);
    }

    // Mettre à jour la quantité d'un produit
    static updateItemQuantity(cart, productId, quantity) {
        const item = cart.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            return this.updateCartTotals(cart);
        }
        return cart;
    }

    // Vider le panier
    static clearCart() {
        return this.initializeCart();
    }
}
