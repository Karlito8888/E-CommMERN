// frontend/src/redux/features/usersApiSlice.js
import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoints publics
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),

    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: `${USERS_URL}/password/reset/request`,
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/password/reset`,
        method: "POST",
        body: data,
      }),
    }),

    // Endpoints authentifiés
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),

    getProfile: builder.query({
      query: () => `${USERS_URL}/profile`,
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateShippingAddress: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/shipping-address`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/password/change`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export des hooks générés
export const {
  useRegisterMutation,
  useLoginMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateShippingAddressMutation,
  useChangePasswordMutation,
} = usersApiSlice;
