// frontend/src/redux/features/cart/cartApiSlice.js

import { apiSlice } from "../apiSlice";
import { CART_URL } from "../../constants";
import { CartCalculator } from "../../../Utils/cartUtils";

/**
 * Slice API pour la gestion du panier
 * Gère toutes les interactions avec l'API du panier
 */
export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Récupérer le panier (utilisateur connecté)
     * GET /api/cart
     */
    getCart: builder.query({
      query: () => ({
        url: CART_URL,
      }),
      transformResponse: (response) => ({
        ...response,
        items: response.items.map(item => CartCalculator.formatCartItemFromApi(item))
      }),
      providesTags: ["Cart"],
    }),

    /**
     * Synchroniser le panier avec le backend
     * POST /api/cart
     */
    syncCart: builder.mutation({
      query: (cartItems) => ({
        url: CART_URL,
        method: "POST",
        body: { 
          items: cartItems
            .filter(item => CartCalculator.validateCartItem(item))
            .map(item => CartCalculator.formatCartItemForApi(item))
        },
      }),
      transformResponse: (response) => ({
        ...response,
        items: response.items.map(item => CartCalculator.formatCartItemFromApi(item))
      }),
      invalidatesTags: ["Cart"],
    }),

    /**
     * Vider le panier
     * DELETE /api/cart
     */
    clearCart: builder.mutation({
      query: () => ({
        url: CART_URL,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    /**
     * Valider le panier (pour utilisateur non connecté)
     * POST /api/cart/guest/validate
     */
    validateGuestCart: builder.mutation({
      query: (cartItems) => ({
        url: `${CART_URL}/guest/validate`,
        method: "POST",
        body: { 
          items: cartItems
            .filter(item => CartCalculator.validateCartItem(item))
            .map(item => CartCalculator.formatCartItemForApi(item))
        },
      }),
      transformResponse: (response) => ({
        ...response,
        items: response.items.map(item => CartCalculator.formatCartItemFromApi(item)),
        ...CartCalculator.calculateTotals(response.items)
      }),
    }),
  }),
});

export const {
  useGetCartQuery,
  useSyncCartMutation,
  useClearCartMutation,
  useValidateGuestCartMutation,
} = cartApi;
