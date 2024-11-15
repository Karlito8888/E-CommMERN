import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { CartService } from '../services/cartService.js';

const router = express.Router();

// Middleware pour initialiser le panier
router.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = CartService.initializeCart();
    }
    next();
});

// Ajouter un produit au panier
router.post('/add', authenticate, (req, res) => {
    const { productId, name, price, quantity, image } = req.body;
    req.session.cart = CartService.addItem(req.session.cart, {
        productId,
        name,
        price,
        quantity,
        image
    });
    res.json(req.session.cart);
});

// Retirer un produit du panier
router.delete('/:productId', authenticate, (req, res) => {
    const { productId } = req.params;
    req.session.cart = CartService.removeItem(req.session.cart, productId);
    res.json(req.session.cart);
});

// Mettre à jour la quantité d'un produit
router.put('/:productId', authenticate, (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    req.session.cart = CartService.updateItemQuantity(req.session.cart, productId, quantity);
    res.json(req.session.cart);
});

// Vider le panier
router.delete('/', authenticate, (req, res) => {
    req.session.cart = CartService.clearCart();
    res.json(req.session.cart);
});

// Obtenir le contenu du panier
router.get('/', authenticate, (req, res) => {
    res.json(req.session.cart);
});

export default router;
