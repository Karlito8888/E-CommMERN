// frontend/src/redux/api/orderApiSlice.js

import { apiSlice } from "./apiSlice"; // Importation de la slice API principale
import { ORDERS_URL, PAYPAL_URL } from "../constants"; // Importation des URLs nécessaires

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL, // URL pour créer une commande
        method: "POST",
        body: order,
      }),
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`, // URL pour obtenir les détails d'une commande
      }),
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`, // URL pour payer une commande
        method: "PUT",
        body: details,
      }),
    }),

    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL, // URL pour obtenir l'ID client PayPal
      }),
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`, // URL pour obtenir les commandes de l'utilisateur
      }),
      keepUnusedDataFor: 5, // Durée de conservation des données inutilisées
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL, // URL pour obtenir toutes les commandes
      }),
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`, // URL pour livrer une commande
        method: "PUT",
      }),
    }),

    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/total-orders`, // URL pour obtenir le total des commandes
    }),

    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/total-sales`, // URL pour obtenir le total des ventes
    }),

    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/total-sales-by-date`, // URL pour obtenir le total des ventes par date
    }),
  }),
});

// Exportation des hooks générés pour les commandes
export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
} = orderApiSlice;
