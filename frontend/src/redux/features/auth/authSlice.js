import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  expirationTime: localStorage.getItem("expirationTime")
    ? JSON.parse(localStorage.getItem("expirationTime"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));

      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 jours
      state.expirationTime = expirationTime;
      localStorage.setItem("expirationTime", expirationTime);
    },
    logout: (state) => {
      state.userInfo = null;
      state.expirationTime = null;
      localStorage.clear();
    },
    checkExpiration: (state) => {
      const currentTime = new Date().getTime();
      if (state.expirationTime && currentTime > state.expirationTime) {
        state.userInfo = null;
        state.expirationTime = null;
        localStorage.clear();
      }
    },
  },
});

export const { setCredentials, logout, checkExpiration } = authSlice.actions;

export default authSlice.reducer;
