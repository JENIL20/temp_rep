import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { store } from '../../store';
import { logout } from '../../domains/auth/store/authSlice';

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, tenantId } = store.getState().auth;
    // console.log("Interceptor - token = ", token, "tenantId =", tenantId);

    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (tenantId !== null && tenantId !== undefined) {
        config.headers['TenantId'] = tenantId.toString();
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response?.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
