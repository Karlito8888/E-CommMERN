// frontend/src/redux/features/categoriesApiSlice.js
import { apiSlice } from './apiSlice';
import { CATEGORY_URL } from '../constants';

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoints publics
    getCategories: builder.query({
      query: () => ({
        url: CATEGORY_URL,
        method: 'GET'
      }),
      transformResponse: (response) => 
        response.sort((a, b) => a.name.localeCompare(b.name, 'fr-FR')),
      providesTags: ['Category'],
      keepUnusedDataFor: 30 * 60, // Cache pendant 30 minutes car change rarement
    }),

    getCategoryById: builder.query({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: 'GET'
      }),
      providesTags: ['Category'],
      keepUnusedDataFor: 30 * 60,
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
} = categoriesApiSlice;
