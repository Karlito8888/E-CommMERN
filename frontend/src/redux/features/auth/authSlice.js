// frontend/src/redux/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    updateUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
      localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    },
  },
});

export const { setCredentials, logout, updateUserInfo } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.userInfo;
export const selectIsAuthenticated = (state) => Boolean(state.auth.userInfo);
export const selectIsAdmin = (state) => state.auth.userInfo?.isAdmin || false;

export default authSlice.reducer;
