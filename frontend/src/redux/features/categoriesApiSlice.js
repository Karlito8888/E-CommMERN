// frontend/src/redux/features/categoriesApiSlice.js

import { apiSlice } from "./apiSlice";
import { CATEGORY_URL } from "../constants";

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: newCategory,
      }),
      // Ajoutez ici un gestionnaire d'erreur si nécessaire
      // onQueryStarted: async (arg, { dispatch, queryFulfilled }) => { ... },
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, updatedCategory }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "PUT",
        body: updatedCategory,
      }),
      // Gestion des erreurs
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "DELETE",
      }),
      // Gestion des erreurs
    }),

    fetchCategories: builder.query({
      query: () => CATEGORY_URL, // Modifiez pour correspondre à l'URL correcte
    }),

    // Ajouter une méthode pour obtenir une catégorie par ID
    fetchCategoryById: builder.query({
      query: (id) => `${CATEGORY_URL}/${id}`,
    }),
  }),
});

// Exportez les hooks pour chaque requête
export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
  useFetchCategoryByIdQuery, // Hook pour obtenir une catégorie par ID
} = categoriesApiSlice;
