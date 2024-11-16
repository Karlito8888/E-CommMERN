// frontend/src/redux/features/productApiSlice.js
import { apiSlice } from './apiSlice';
import { PRODUCT_URL } from '../constants';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoints publics
    getProducts: builder.query({
      query: (queryParams = '') => ({
        url: `${PRODUCT_URL}${queryParams}`,
        method: 'GET',
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
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetTopRatedProductsQuery,
} = productApiSlice;
