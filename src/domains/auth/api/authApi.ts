import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from '../types/auth.types';

import { IS_OFFLINE_MODE } from '../../../shared/config';

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            // Return a dummy admin user
            return {
                token: 'dummy-jwt-token-' + Date.now(),
                expiration: new Date(Date.now() + 86400000).toISOString(),
                tenantId: 101, // Dummy tenantId
                user: {
                    id: 1,
                    userName: 'admin',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: credentials.email || 'admin@example.com',
                    roles: ['Admin', 'Instructor'],
                    mobile: '1234567890',
                    tenantId: 101 // Also in user object
                }
            } as AuthResponse;
        }

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                token: 'dummy-jwt-token-' + Date.now(),
                expiration: new Date(Date.now() + 86400000).toISOString(),
                user: {
                    id: Math.floor(Math.random() * 1000),
                    userName: userData.userName || 'newuser',
                    firstName: userData.firstName || 'New',
                    lastName: userData.lastName || 'User',
                    email: userData.email || 'new@example.com',
                    roles: ['Student'],
                    mobile: userData.mobile
                }
            } as AuthResponse;
        }

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

        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { message: 'Password reset link sent to email (mock)' };
        }


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

        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { message: 'Password reset successfully (mock)' };
        }


        try {
            const response = await api.post(API.AUTH.RESET_PASSWORD, data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Reset Password');
        }
    }
};
