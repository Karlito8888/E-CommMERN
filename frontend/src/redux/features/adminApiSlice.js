// frontend/src/redux/features/adminApiSlice.js
import { apiSlice } from './apiSlice';
import { USERS_URL, ORDERS_URL, PRODUCT_URL, CATEGORY_URL } from '../constants';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Gestion des utilisateurs
    getUsers: builder.query({
      query: () => USERS_URL,
      providesTags: ['User'],
    }),

    getUserDetails: builder.query({
      query: (userId) => `${USERS_URL}/${userId}`,
      providesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Gestion des commandes
    getAllOrders: builder.query({
      query: () => ORDERS_URL,
      providesTags: ['Order'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, ...data }) => ({
        url: `${ORDERS_URL}/${orderId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: ['Order'],
    }),

    // Gestion des produits
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCT_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, ...data }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    uploadImage: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/upload`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // Gestion des catégories
    createCategory: builder.mutation({
      query: (data) => ({
        url: CATEGORY_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, ...data }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  // Users
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  
  // Orders
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeliverOrderMutation,
  usePayOrderMutation,
  
  // Products
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadImageMutation,
  
  // Categories
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = adminApiSlice;
