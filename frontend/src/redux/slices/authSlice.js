import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;