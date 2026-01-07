import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { UserRole } from '../types/role.types';

/**
 * API Error Handler
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[UserRoleAPI Error - ${context}]:`, error);
    if (error.response) {
        const message = error.response.data?.message || error.response.statusText || 'Server error occurred';
        throw new Error(`${context}: ${message}`);
    } else if (error.request) {
        throw new Error(`${context}: No response from server. Please check your connection.`);
    } else {
        throw new Error(`${context}: ${error.message || 'Unknown error occurred'}`);
    }
};

/**
 * Validates ID
 */
const validateId = (id: number, name: string = 'ID'): void => {
    if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error(`Valid ${name} is required`);
    }
};

export const userRoleApi = {
    /**
     * Assign role to user
     * @param userId - User ID
     * @param roleId - Role ID
     * @returns Promise with assignment response
     * @throws Error if validation fails or API call fails
     */
    assign: async (userId: number, roleId: number) => {
        try {
            validateId(userId, 'userId');
            validateId(roleId, 'roleId');
            const result = await api.post(API.USER_ROLE.ASSIGN, null, {
                params: { userId, roleId },
            });
            return result;
        } catch (error) {
            handleApiError(error, 'Assign role to user');
        }
    },

    /**
     * Remove role from user
     * @param userId - User ID
     * @param roleId - Role ID
     * @returns Promise with removal response
     * @throws Error if validation fails or API call fails
     */
    remove: async (userId: number, roleId: number) => {
        try {
            validateId(userId, 'userId');
            validateId(roleId, 'roleId');
            const result = await api.delete(API.USER_ROLE.REMOVE, {
                params: { userId, roleId },
            });
            return result;
        } catch (error) {
            handleApiError(error, 'Remove role from user');
        }
    },

    /**
     * Get user roles
     * @param userId - User ID
     * @returns Promise with array of user roles
     * @throws Error if validation fails or API call fails
     */
    getUserRoles: async (userId: number): Promise<UserRole[]> => {
        try {
            validateId(userId, 'userId');
            const result = await api.get(API.USER_ROLE.GET_USER_ROLES(userId));
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get user roles');
        }
    },
};
