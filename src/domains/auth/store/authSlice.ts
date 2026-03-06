import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserPermissions } from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  tenantId: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** moduleCode → permissionCodes[], e.g. { COURSES: ['view','create'] } */
  permissions: UserPermissions;
}

const initialState: AuthState = {
  user: null,
  token: null,
  tenantId: null,
  isAuthenticated: false,
  loading: false,
  permissions: {},
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

    /** Save the full module-permission map for the logged-in user */
    setPermissions: (state, action: PayloadAction<UserPermissions>) => {
      state.permissions = action.payload;
    },

    /** Clear only permissions (e.g. on role change without full logout) */
    clearPermissions: (state) => {
      state.permissions = {};
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = {};
      // Redux Persist will automatically clear from localStorage
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, setPermissions, clearPermissions, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
