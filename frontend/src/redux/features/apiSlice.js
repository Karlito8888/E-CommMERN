// frontend/src/redux/features/apiSlice.js

import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

// Configuration de base de l'API avec gestion des credentials
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // Important pour les cookies
  prepareHeaders: (headers, { getState }) => {
    // Vous pouvez ajouter des headers par défaut ici si nécessaire
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Wrapper pour gérer les erreurs de requête
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Gérer la déconnexion automatique si nécessaire
    // Vous pouvez dispatcher une action de déconnexion ici
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Order", "User", "Category"],
  endpoints: () => ({}),
});
