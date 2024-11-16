// frontend/src/redux/features/categoriesApiSlice.js
import { apiSlice } from './apiSlice';
import { CATEGORY_URL } from '../constants';

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoints publics uniquement
    getCategories: builder.query({
      query: () => CATEGORY_URL,
      providesTags: ['Category'],
    }),

    getCategoryById: builder.query({
      query: (categoryId) => `${CATEGORY_URL}/id/${categoryId}`,
      providesTags: ['Category'],
    }),

    getCategoryBySlug: builder.query({
      query: (slug) => `${CATEGORY_URL}/slug/${slug}`,
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
} = categoriesApiSlice;
