import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from '../types/auth.types';

const handleApiError = (error: any, context: string): never => {
    console.error(`[AuthAPI Error - ${context}]:`, error);
    if (error.response) {
        throw new Error(error.response.data?.message || 'Server error occurred');
    }
    throw new Error(error.message || 'Unknown error occurred');
};

export const authApi = {
    /**
     * Login user
     */
    login: async (credentials: LoginRequest) => {
        try {
            const response = await api.post<AuthResponse>(API.AUTH.LOGIN, credentials);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Login');
        }
    },

    /**
     * Register new user
     */
    register: async (userData: RegisterRequest) => {
        try {
            const response = await api.post<AuthResponse>(API.AUTH.REGISTER, userData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Register');
        }
    },

    /**
     * Forgot password request
     */
    forgotPassword: async (data: ForgotPasswordRequest) => {
        try {
            const response = await api.post(API.AUTH.FORGOT_PASSWORD, data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Forgot Password');
        }
    },

    /**
     * Reset password with token
     */
    resetPassword: async (data: ResetPasswordRequest) => {
        try {
            const response = await api.post(API.AUTH.RESET_PASSWORD, data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Reset Password');
        }
    }
};
