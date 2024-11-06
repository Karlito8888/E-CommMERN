import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  products: [],
  filters: {
    selectedCategories: [],
    priceRange: [],
    selectedBrands: [],
  },
  brandCheckboxes: {},
  checked: [], // Ajout de l'état checked
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setSelectedCategories: (state, action) => {
      state.filters.selectedCategories = action.payload;
    },
    setPriceRange: (state, action) => {
      state.filters.priceRange = action.payload;
    },
    setSelectedBrands: (state, action) => {
      state.filters.selectedBrands = action.payload;
    },
    setChecked: (state, action) => {
      state.checked = action.payload; // Mise à jour de l'état checked
    },
  },
});

export const {
  setCategories,
  setProducts,
  setSelectedCategories,
  setPriceRange,
  setSelectedBrands,
  setChecked, // Exporte le nouvel action creator
} = shopSlice.actions;

export default shopSlice.reducer;
