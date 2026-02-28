import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  tenantId: number | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  tenantId: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; tenantId?: number }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.tenantId = action.payload.tenantId || action.payload.user.tenantId || null;
      state.isAuthenticated = true;
      // Redux Persist will automatically save to localStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Redux Persist will automatically clear from localStorage
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
