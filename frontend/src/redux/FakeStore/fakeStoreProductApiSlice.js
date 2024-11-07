// src/redux/FakeStoreProductApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const fakeStoreApi = createApi({
  reducerPath: "fakeStoreApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://fakestoreapi.com" }),
  endpoints: (builder) => ({
    // Récupérer tous les produits
    getProducts: builder.query({
      query: () => "/products",
    }),

    // Récupérer un seul produit par ID
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
    }),

    // Récupérer les produits d'une catégorie spécifique
    getProductsByCategory: builder.query({
      query: (category) => `/products/category/${category}`,
    }),

    // Ajouter un produit
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
    }),

    // Mettre à jour un produit
    updateProduct: builder.mutation({
      query: ({ id, updatedProduct }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: updatedProduct,
      }),
    }),

    // Supprimer un produit
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = fakeStoreApi;

