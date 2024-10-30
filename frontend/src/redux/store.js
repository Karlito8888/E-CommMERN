// frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./api/apiSlice"; // Importation de la slice API principale
import authReducer from "./features/auth/authSlice"; // Reducer pour l'authentification
// import favoritesReducer from "./features/favorites/favoriteSlice"; // Reducer pour les favoris
// import cartSliceReducer from "./features/cart/cartSlice"; // Reducer pour le panier
// import shopReducer from "./features/shop/shopSlice"; // Reducer pour la boutique
import { getFavoritesFromLocalStorage } from "../Utils/localStorage"; // Fonction pour obtenir les favoris du localStorage

// Récupération des favoris depuis le localStorage
// const initialFavorites = getFavoritesFromLocalStorage() || [];

// Configuration du store Redux
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // Intégration de la slice API
    auth: authReducer, // Reducer pour l'authentification
    // favorites: favoritesReducer, // Reducer pour les favoris
    // cart: cartSliceReducer, // Reducer pour le panier
    // shop: shopReducer, // Reducer pour la boutique
  },
  // preloadedState: {
  //   favorites: initialFavorites, // État initial des favoris
  // },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // Ajout du middleware de la slice API
  devTools: true, // Activation des outils de développement
});

// Configuration des listeners pour gérer les requêtes
setupListeners(store.dispatch);

export default store; // Exportation du store
