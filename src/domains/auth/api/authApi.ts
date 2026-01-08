import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { User } from '../../auth/store/authSlice';

interface LoginResponse {
    user: User;
    access_token: string;
}

interface RegisterResponse {
    user: User;
    token?: string;
}

const handleApiError = (error: any, context: string): never => {
    console.error(`[AuthAPI Error - ${context}]:`, error);
    if (error.response) {
        throw new Error(error.response.data?.message || 'Server error occurred');
    }
    throw new Error(error.message || 'Unknown error occurred');
};

// Development Mode Flag
const IS_DEV = import.meta.env.MODE === 'development';

const DUMMY_USER: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
};

export const authApi = {
    /**
     * Login user
     */
    login: async (credentials: { email: string; password: string }) => {
        if (IS_DEV) {
            console.log("DEV: Returning dummy login");
            return {
                user: DUMMY_USER,
                access_token: 'dummy_token_12345'
            };
        }

        try {
            const response = await api.post<LoginResponse>(API.AUTH.LOGIN, credentials);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Login');
        }
    },

    /**
     * Register new user
     */
    register: async (userData: any) => {
        if (IS_DEV) {
            return {
                user: { ...DUMMY_USER, ...userData, id: '2' },
                token: 'dummy_token_54321'
            };
        }

        try {
            const response = await api.post<RegisterResponse>(API.AUTH.REGISTER, userData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Register');
        }
    },

    /**
     * Forgot password request
     */
    forgotPassword: async (email: string) => {
        if (IS_DEV) {
            return { message: 'Reset email sent (mock)' };
        }

        try {
            const response = await api.post(API.AUTH.FORGOT_PASSWORD, { email });
            return response.data;
        } catch (error) {
            handleApiError(error, 'Forgot Password');
        }
    },

    /**
     * Reset password with token
     */
    resetPassword: async (data: any) => {
        if (IS_DEV) {
            return { message: 'Password reset successful (mock)' };
        }

        try {
            const response = await api.post(API.AUTH.RESET_PASSWORD, data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Reset Password');
        }
    }
};
