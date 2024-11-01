// frontend/src/redux/features/adminApiSlice.js

import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

// Définition des points de terminaison pour les utilisateurs (avec autorisation admin)
export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Obtenir tous les utilisateurs
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ["User"],
    }),
    // Supprimer un utilisateur par ID
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    // Obtenir un utilisateur par ID
    getUserById: builder.query({
      query: (id) => `${USERS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    // Mettre à jour un utilisateur par ID
    updateUserById: builder.mutation({
      query: ({ id, ...updatedUser }) => ({
        url: `${USERS_URL}/${id}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
  }),
});

// Export des hooks générés par les points de terminaison
export const {
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
} = adminApiSlice;

