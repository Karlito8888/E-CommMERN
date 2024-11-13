// frontend/src/redux/features/services/paymentService.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApiSlice = createApi({
  reducerPath: "paymentApi", // Nom de l'API pour le slice
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api", // URL de ton backend
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (cartData) => ({
        url: "/payments/create-checkout-session", // La route API
        method: "POST",
        body: cartData, // Envoie les données du panier à l'API
      }),
    }),
    // Ajoute un endpoint pour récupérer une session de paiement
    getSession: builder.query({
      query: (sessionId) => `/payments/session/${sessionId}`, // Route pour récupérer la session
    }),
  }),
});

export const { useCreateCheckoutSessionMutation, useGetSessionQuery } =
  paymentApiSlice;

export default paymentApiSlice;

