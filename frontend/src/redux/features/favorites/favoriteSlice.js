import { createSlice } from "@reduxjs/toolkit";
import { FavoritesStorage } from "../../../Utils/localStorage";

// Charger l'état initial depuis le localStorage
const initialState = FavoritesStorage.getItems();

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const product = action.payload;
      if (!state.some((item) => item._id === product._id)) {
        state.push(product);
        // Synchroniser avec localStorage
        FavoritesStorage.addItem(product);
      }
    },
    removeFromFavorites: (state, action) => {
      const productId = action.payload._id;
      const newState = state.filter((product) => product._id !== productId);
      // Synchroniser avec localStorage
      FavoritesStorage.removeItem(productId);
      return newState;
    },
    setFavorites: (state, action) => {
      const favorites = action.payload;
      // Synchroniser avec localStorage
      FavoritesStorage.set(favorites);
      return favorites;
    },
    clearFavorites: (state) => {
      // Synchroniser avec localStorage
      FavoritesStorage.clear();
      return [];
    },
  },
});

export const { 
  addToFavorites, 
  removeFromFavorites, 
  setFavorites,
  clearFavorites 
} = favoriteSlice.actions;

export const selectFavoriteProducts = (state) => state.favorites;
export const selectIsFavorite = (productId) => (state) => 
  state.favorites.some(product => product._id === productId);

export default favoriteSlice.reducer;
