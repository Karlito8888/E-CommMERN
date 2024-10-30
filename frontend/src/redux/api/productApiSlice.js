// frontend/src/redux/api/productApiSlice.js

import { PRODUCT_URL, UPLOAD_URL } from "../constants"; // Importation des URLs nécessaires
import { apiSlice } from "./apiSlice"; // Importation de la slice API principale

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword }) => ({
        url: PRODUCT_URL,
        params: { keyword }, // Paramètres pour la requête
      }),
      keepUnusedDataFor: 5, // Durée de conservation des données inutilisées
      providesTags: ["Products"], // Tag pour la mise en cache
    }),

    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`, // Requête pour obtenir un produit par ID
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId }, // Tag pour le produit spécifique
      ],
    }),

    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allProducts`, // Récupération de tous les produits
      providesTags: ["Products"], // Tag pour la mise en cache
    }),

    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5, // Durée de conservation des données inutilisées
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: PRODUCT_URL,
        method: "POST", // Méthode pour créer un produit
        body: productData,
      }),
      invalidatesTags: ["Products"], // Invalidation du cache pour les produits après création
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT", // Méthode pour mettre à jour un produit
        body: formData,
      }),
      invalidatesTags: ["Product"], // Invalidation du cache pour le produit mis à jour
    }),

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: UPLOAD_URL, // URL pour uploader l'image
        method: "POST",
        body: data,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE", // Méthode pour supprimer un produit
      }),
      invalidatesTags: ["Products"], // Invalidation du cache pour les produits après suppression
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`, // URL pour créer un avis
        method: "POST",
        body: data,
      }),
    }),

    getTopProducts: builder.query({
      query: () => `${PRODUCT_URL}/top`, // Récupération des produits les mieux notés
      keepUnusedDataFor: 5,
    }),

    getNewProducts: builder.query({
      query: () => `${PRODUCT_URL}/new`, // Récupération des nouveaux produits
      keepUnusedDataFor: 5,
    }),

    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`, // URL pour obtenir les produits filtrés
        method: "POST",
        body: { checked, radio }, // Corps de la requête avec les filtres
      }),
    }),
  }),
});

// Exportation des hooks générés pour les produits
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductDetailsQuery,
  useAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
} = productApiSlice;
