// frontend/src/redux/store.js

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./features/apiSlice";
import authReducer from "./features/auth/authSlice";
import favoritesReducer from "./features/favorites/favoriteSlice";
import cartReducer from "./features/cart/cartSlice";
import shopReducer from "./features/shop/shopSlice";
import paymentApiSlice from "./features/services/paymentService";
import { 
  getFavoritesFromLocalStorage,
  getCartFromLocalStorage,
  getAuthFromLocalStorage
} from "../Utils/localStorage";

/**
 * Configuration des middlewares Redux
 * @param {Function} getDefaultMiddleware - Fonction pour obtenir les middlewares par défaut
 * @returns {Array} Liste des middlewares configurés
 */
const configureMiddleware = (getDefaultMiddleware) => {
  // Configuration des middlewares par défaut
  const defaultMiddlewareConfig = {
    serializableCheck: {
      // Ignorer certaines actions non-sérialisables
      ignoredActions: ['persist/PERSIST']
    },
    // Autres configurations des middlewares...
  };

  return getDefaultMiddleware(defaultMiddlewareConfig)
    .concat(apiSlice.middleware)
    .concat(paymentApiSlice.middleware);
};

/**
 * Chargement de l'état initial depuis le localStorage
 * @returns {Object} État initial pour le store
 */
const loadInitialState = () => {
  return {
    favorites: getFavoritesFromLocalStorage() || [],
    cart: getCartFromLocalStorage() || {
      items: [],
      shippingAddress: {},
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0
    },
    auth: getAuthFromLocalStorage() || {
      userInfo: null,
      loading: false,
      error: null
    }
  };
};

/**
 * Configuration du store Redux
 */
const store = configureStore({
  reducer: {
    // API Slices
    [apiSlice.reducerPath]: apiSlice.reducer,
    [paymentApiSlice.reducerPath]: paymentApiSlice.reducer,
    
    // Feature Slices
    auth: authReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
    shop: shopReducer
  },
  preloadedState: loadInitialState(),
  middleware: configureMiddleware,
  devTools: process.env.NODE_ENV !== 'production',
});

// Configuration des listeners RTK Query
setupListeners(store.dispatch);

// Écouter les changements d'état pour la synchronisation avec le localStorage
store.subscribe(() => {
  const state = store.getState();
  
  // Synchroniser le panier
  if (state.cart) {
    localStorage.setItem('cart', JSON.stringify(state.cart));
  }
  
  // Synchroniser les favoris
  if (state.favorites) {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
  }
  
  // Synchroniser l'authentification
  if (state.auth?.userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(state.auth.userInfo));
  }
});

export default store;
