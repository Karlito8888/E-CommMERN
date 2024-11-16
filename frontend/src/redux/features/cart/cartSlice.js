// frontend/src/redux/features/cart/cartSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { CartCalculator } from "../../../Utils/cartUtils";
import { cartApi } from "./cartApiSlice";

const initialState = {
  items: [],
  shippingAddress: {},
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      
      if (!CartCalculator.validateCartItem(newItem)) {
        state.error = "Article invalide";
        return;
      }

      const existingItem = state.items.find((x) => x.product === newItem.product);

      if (existingItem) {
        existingItem.quantity = Math.min(
          newItem.quantity,
          existingItem.countInStock || Infinity
        );
      } else {
        state.items.push(newItem);
      }

      // Recalculer les totaux
      const totals = CartCalculator.calculateTotals(state.items);
      Object.assign(state, totals);
      state.error = null;

      // Préparer pour le stockage local
      state.items = CartCalculator.prepareCartForStorage(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((x) => x.product !== action.payload);
      
      // Recalculer les totaux
      const totals = CartCalculator.calculateTotals(state.items);
      Object.assign(state, totals);
      state.error = null;
    },

    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((x) => x.product === productId);
      
      if (item) {
        if (quantity > 0 && quantity <= (item.countInStock || Infinity)) {
          item.quantity = quantity;
          // Recalculer les totaux
          const totals = CartCalculator.calculateTotals(state.items);
          Object.assign(state, totals);
          state.error = null;
        } else {
          state.error = "Quantité invalide";
        }
      }
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      state.error = null;
    },

    clearCart: (state) => {
      state.items = [];
      const totals = CartCalculator.calculateTotals([]);
      Object.assign(state, totals);
      state.error = null;
    },

    resetCart: (state) => {
      Object.assign(state, initialState);
    },

    setCartError: (state, action) => {
      state.error = action.payload;
    },

    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  
  // Gérer les actions asynchrones du cartApi
  extraReducers: (builder) => {
    builder
      // GetCart
      .addMatcher(
        cartApi.endpoints.getCart.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        cartApi.endpoints.getCart.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.items = CartCalculator.prepareCartForStorage(payload.items);
          const totals = CartCalculator.calculateTotals(payload.items);
          Object.assign(state, totals);
          state.error = null;
        }
      )
      .addMatcher(
        cartApi.endpoints.getCart.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
        }
      )
      // SyncCart
      .addMatcher(
        cartApi.endpoints.syncCart.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        cartApi.endpoints.syncCart.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.items = CartCalculator.prepareCartForStorage(payload.items);
          const totals = CartCalculator.calculateTotals(payload.items);
          Object.assign(state, totals);
          state.error = null;
        }
      )
      .addMatcher(
        cartApi.endpoints.syncCart.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
        }
      );
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  saveShippingAddress,
  clearCart,
  resetCart,
  setCartError,
  setCartLoading,
} = cartSlice.actions;

// Sélecteurs
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemById = (state, productId) => 
  state.cart.items.find(item => item.product === productId);
export const selectCartTotals = (state) => ({
  itemsPrice: state.cart.itemsPrice,
  shippingPrice: state.cart.shippingPrice,
  taxPrice: state.cart.taxPrice,
  totalPrice: state.cart.totalPrice,
});
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectCartError = (state) => state.cart.error;
export const selectCartLoading = (state) => state.cart.loading;

export default cartSlice.reducer;
