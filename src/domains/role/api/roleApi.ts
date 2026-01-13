import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Role, CreateRoleRequest } from '../types/role.types';

/**
 * API Error Handler
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[RoleAPI Error - ${context}]:`, error);
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

export const roleApi = {
    /**
     * List all roles
     */
    list: async (): Promise<Role[]> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return DUMMY_ROLES;
        }

        try {
            const response = await api.get<Role[]>(API.USER_PERMISSIONS.ROLES);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch roles');
        }
    },

    /**
     * Get role permissions list
     * @returns Promise with array of role permissions
     * @throws Error if API call fails
     */
    getRolePermissions: async (): Promise<any[]> => {
        try {
            const response = await api.post<Role>(API.USER_PERMISSIONS.ROLES, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create role');
        }
    },

    /**
     * Get role by ID
     * @param id - Role ID
     * @returns Promise with role details
     * @throws Error if validation fails or API call fails
     */
    getById: async (id: number): Promise<Role> => {
        try {
            validateId(id);
            const result = await api.get(API.ROLE.GET_BY_ID(id));
            if (!result) throw new Error('Role not found');
            return result as Role;
        } catch (error) {
            handleApiError(error, 'Get role by ID');
        }
    },

    /**
     * Delete a role
     */
    delete: async (id: number): Promise<void> => {
        try {
            validateId(id);
            await api.delete(API.ROLE.DELETE(id));
        } catch (error) {
            handleApiError(error, 'Delete role');
        }
    }
};
