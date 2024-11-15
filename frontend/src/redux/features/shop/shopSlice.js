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
  checked: [],
  radio: [], // Ajout de l'état radio
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
      state.checked = action.payload;
    },
    setRadio: (state, action) => {
      state.radio = action.payload;
    },
  },
});

export const {
  setCategories,
  setProducts,
  setSelectedCategories,
  setPriceRange,
  setSelectedBrands,
  setChecked,
  setRadio,
} = shopSlice.actions;

export default shopSlice.reducer;
