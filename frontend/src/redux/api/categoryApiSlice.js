// frontend/src/redux/api/categoryApiSlice.js

import { apiSlice } from "./apiSlice"; // Importation de la slice API principale
import { CATEGORY_URL } from "../constants"; // Importation de l'URL des catégories

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: CATEGORY_URL,
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["Category"], // Invalidation du cache pour les catégories après création
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, updatedCategory }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "PUT",
        body: updatedCategory,
      }),
      invalidatesTags: ["Category"], // Invalidation du cache pour les catégories après mise à jour
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"], // Invalidation du cache pour les catégories après suppression
    }),

    fetchCategories: builder.query({
      query: () => CATEGORY_URL, // Simplification de l'URL pour obtenir les catégories
      providesTags: ["Category"], // Tag pour la mise en cache
      keepUnusedDataFor: 5, // Garder les données inutilisées pendant 5 secondes
    }),
  }),
});

// Exportation des hooks générés pour les catégories
export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} = categoryApiSlice;
