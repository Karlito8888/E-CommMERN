// frontend/src/redux/features/usersApiSlice.js

import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

// Définition des points de terminaison pour les utilisateurs (sans autorisation admin)
export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Créer un nouvel utilisateur
    createUser: builder.mutation({
      query: (newUser) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: newUser,
      }),
    }),
    // Connexion d'un utilisateur
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: credentials,
      }),
    }),
    // Déconnexion d'un utilisateur
    logoutUser: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    // Obtenir le profil de l'utilisateur actuel
    getCurrentUserProfile: builder.query({
      query: () => `${USERS_URL}/profile`,
      providesTags: ["User"],
    }),
    // Mettre à jour le profil de l'utilisateur actuel
    updateCurrentUserProfile: builder.mutation({
      query: (userData) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    // Changer le mot de passe
    changeUserPassword: builder.mutation({
      query: (passwordData) => ({
        url: `${USERS_URL}/password/change`,
        method: "POST",
        body: passwordData,
      }),
    }),
    // Demander une réinitialisation de mot de passe
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: `${USERS_URL}/password/reset/request`,
        method: "POST",
        body: { email },
      }),
    }),
    // Réinitialiser le mot de passe
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: `${USERS_URL}/password/reset`,
        method: "POST",
        body: resetData,
      }),
    }),
  }),
});

// Export des hooks générés par les points de terminaison
export const {
  useCreateUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
  useChangeUserPasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = usersApiSlice;
