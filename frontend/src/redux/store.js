// frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
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
 * Chargement de l'état initial depuis le localStorage
 * @returns {Object} État initial pour le store
 */
const loadInitialState = () => {
  return {
    auth: {
      userInfo: getAuthFromLocalStorage()
    },
    favorites: {
      items: getFavoritesFromLocalStorage() || []
    },
    cart: getCartFromLocalStorage() || {
      items: [],
      shippingAddress: {},
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0
    }
  };
};

/**
 * Configuration du store Redux
 */
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [paymentApiSlice.reducerPath]: paymentApiSlice.reducer,
    auth: authReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
    shop: shopReducer,
  },
  preloadedState: loadInitialState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: process.env.NODE_ENV === 'production',
      immutableCheck: process.env.NODE_ENV === 'production'
    })
    .concat(apiSlice.middleware)
    .concat(paymentApiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Configuration des listeners pour RTK Query
setupListeners(store.dispatch);

export default store;
