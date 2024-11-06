import { apiSlice } from "./apiSlice";
import { ORDERS_URL, PAYPAL_URL } from "../constants";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Création d'une nouvelle commande
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    // Récupérer les détails d'une commande spécifique par ID
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
    }),

    // Marquer une commande comme payée
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: details,
      }),
    }),

    // Récupérer l'ID du client PayPal
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
    }),

    // Récupérer les commandes de l'utilisateur connecté
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    // Récupérer toutes les commandes (admin uniquement)
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
    }),

    // Marquer une commande comme livrée (admin uniquement)
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),

    // Récupérer le nombre total de commandes (admin uniquement)
    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/orders/count`,
    }),

    // Récupérer le total des ventes (admin uniquement)
    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/sales/total`,
    }),

    // Récupérer les ventes par date (admin uniquement)
    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/sales/by-date`,
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
} = orderApiSlice;
