// frontend/src/redux/api/apiSlice.js

import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { BASE_URL } from "../constants";

// Fonction pour exécuter une requête Axios
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (error) {
      return {
        error: { status: error.response?.status, message: error.message },
      };
    }
  };

// Création de la slice API principale
export const apiSlice = createApi({
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["User", "Category", "Product", "Order"],
  endpoints: () => ({}), // Les endpoints seront définis dans les fichiers spécifiques
});
