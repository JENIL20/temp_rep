import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';

const baseURL = import.meta.env.VITE_API_URL

console.log('API baseURL = ', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1', // Change from 'true' to '1' or any number
  },
});


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request URL:', config.baseURL + config.url);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('Full Error Object:', error);
    console.error('Response:', error.response);
    console.error('Request:', error.config);
    console.error('Status:', error.response?.status);

    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export default api;