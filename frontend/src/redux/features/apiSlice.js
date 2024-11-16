import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

// Configuration de base pour toutes les requêtes API
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // Nécessaire pour les cookies d'authentification
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// API Slice de base avec les configurations essentielles
export const apiSlice = createApi({
  reducerPath: 'api', // Important pour l'organisation du store
  baseQuery,
  tagTypes: ['Product', 'Order', 'User', 'Category', 'Cart'], // Ajout de 'Cart' pour la gestion du panier
  endpoints: () => ({}),
});

// Re-export pour utilisation dans d'autres slices
export const {
  middleware: apiMiddleware,
  reducer: apiReducer,
  reducerPath: apiReducerPath,
} = apiSlice;