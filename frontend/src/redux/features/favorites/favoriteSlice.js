import { createSlice } from "@reduxjs/toolkit";
import { FavoritesStorage } from "../../../Utils/localStorage";

// Charger l'état initial depuis le localStorage
const initialState = {
  items: FavoritesStorage.getItems() || [],
  loading: false,
  error: null,
  lastUpdated: null
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    initializeFavorites: (state) => {
      const storedFavorites = FavoritesStorage.getItems();
      state.items = storedFavorites || [];
      state.lastUpdated = new Date().toISOString();
    },
    addToFavorites: (state, action) => {
      const product = action.payload;
      if (!state.items.some((item) => item._id === product._id)) {
        state.items.push(product);
        state.lastUpdated = new Date().toISOString();
        // Synchroniser avec localStorage
        FavoritesStorage.addItem(product);
      }
    },
    removeFromFavorites: (state, action) => {
      const productId = action.payload._id;
      state.items = state.items.filter((product) => product._id !== productId);
      state.lastUpdated = new Date().toISOString();
      // Synchroniser avec localStorage
      FavoritesStorage.removeItem(productId);
    },
    setFavorites: (state, action) => {
      state.items = action.payload;
      state.lastUpdated = new Date().toISOString();
      // Synchroniser avec localStorage
      FavoritesStorage.set(action.payload);
    },
    clearFavorites: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
      // Synchroniser avec localStorage
      FavoritesStorage.clear();
    },
    toggleFavorite: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex(item => item._id === product._id);
      
      if (index === -1) {
        state.items.push(product);
        FavoritesStorage.addItem(product);
      } else {
        state.items.splice(index, 1);
        FavoritesStorage.removeItem(product._id);
      }
      state.lastUpdated = new Date().toISOString();
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    }
  },
});

export const { 
  addToFavorites, 
  removeFromFavorites, 
  setFavorites,
  clearFavorites,
  toggleFavorite,
  setError,
  setLoading,
  initializeFavorites
} = favoriteSlice.actions;

// Selectors
export const selectFavoriteProducts = (state) => state.favorites.items;
export const selectFavoritesCount = (state) => state.favorites.items.length;
export const selectIsFavorite = (state, productId) => 
  state.favorites.items.some(item => item._id === productId);
export const selectFavoritesError = (state) => state.favorites.error;
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesLastUpdated = (state) => state.favorites.lastUpdated;

export default favoriteSlice.reducer;
