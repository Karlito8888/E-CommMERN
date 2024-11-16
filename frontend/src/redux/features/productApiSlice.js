// frontend/src/redux/features/productApiSlice.js
import { apiSlice } from './apiSlice';
import { PRODUCT_URL } from '../constants';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoints publics
    getProducts: builder.query({
      query: (params = {}) => ({
        url: PRODUCT_URL,
        method: 'GET',
        params,
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 5 * 60, // Cache pendant 5 minutes
    }),

    getProductById: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    getTopRatedProducts: builder.query({
      query: (limit = 3) => ({
        url: `${PRODUCT_URL}/top`,
        method: 'GET',
        params: { limit },
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 10 * 60, // Cache pendant 10 minutes car change moins souvent
    }),

    getFilteredProducts: builder.query({
      query: (filters) => ({
        url: `${PRODUCT_URL}/filter`,
        method: 'POST',
        body: filters,
      }),
      providesTags: ['Product'],
    }),

    getAllBrands: builder.query({
      query: () => ({
        url: `${PRODUCT_URL}/brands`,
        method: 'GET',
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 30 * 60, // Cache pendant 30 minutes car change rarement
    }),

    // Endpoints authentifiés
    createReview: builder.mutation({
      query: ({ productId, rating, comment }) => ({
        url: `${PRODUCT_URL}/${productId}/reviews`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetTopRatedProductsQuery,
  useGetFilteredProductsQuery,
  useGetAllBrandsQuery,
  useCreateReviewMutation,
} = productApiSlice;
