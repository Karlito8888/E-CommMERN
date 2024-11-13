// frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./features/apiSlice";
import authReducer from "./features/auth/authSlice"; // Reducer pour l'authentification
import favoritesReducer from "./features/favorites/favoriteSlice"; // Reducer pour les favoris
import cartSliceReducer from "./features/cart/cartSlice"; // Reducer pour le panier
import shopReducer from "./features/shop/shopSlice"; // Reducer pour la boutique
import { getFavoritesFromLocalStorage } from "../Utils/localStorage";
import paymentApiSlice from "./features/services/paymentService"; // Importer le slice du payment

// Récupération des favoris depuis le localStorage
const initialFavorites = getFavoritesFromLocalStorage() || [];

// Configuration du store Redux
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // Slice principal pour toutes les API
    [paymentApiSlice.reducerPath]: paymentApiSlice.reducer, // Ajouter le reducer de paymentApi
    auth: authReducer, // Reducer pour l'authentification
    favorites: favoritesReducer, // Reducer pour les favoris
    cart: cartSliceReducer, // Reducer pour le panier
    shop: shopReducer, // Reducer pour la boutique
  },
  preloadedState: {
    favorites: initialFavorites, // Précharger les favoris depuis le localStorage
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware) // Ajouter le middleware de apiSlice
      .concat(paymentApiSlice.middleware), // Ajouter le middleware de paymentApi
  devTools: process.env.NODE_ENV !== 'production', // Activer les devTools en mode développement
});

// Configuration des listeners pour gérer les requêtes
setupListeners(store.dispatch);

export default store; // Exportation du store

