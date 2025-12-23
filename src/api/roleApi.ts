import api from './axios';
import { API } from './endpoints';
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
     * Create a role
     * @param data - Role creation request
     * @returns Promise with created role
     * @throws Error if validation fails or API call fails
     */
    create: async (data: CreateRoleRequest): Promise<Role> => {
        try {
            if (!data.name) throw new Error('Role name is required');
            const result = await api.post(API.ROLE.CREATE, data);
            return result as Role;
        } catch (error) {
            handleApiError(error, 'Create role');
        }
    },

    /**
     * Update a role
     * @param id - Role ID
     * @param data - Role update request
     * @returns Promise with updated role
     * @throws Error if validation fails or API call fails
     */
    update: async (id: number, data: CreateRoleRequest): Promise<Role> => {
        try {
            validateId(id);
            if (!data.name) throw new Error('Role name is required');
            const result = await api.put(API.ROLE.UPDATE(id), data);
            return result as Role;
        } catch (error) {
            handleApiError(error, 'Update role');
        }
    },

    /**
     * List all roles
     * @returns Promise with array of all roles
     * @throws Error if API call fails
     */
    list: async (): Promise<Role[]> => {
        try {
            const result = await api.get(API.ROLE.LIST);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'List roles');
        }
    },

    /**
     * Get role permissions list
     * @returns Promise with array of role permissions
     * @throws Error if API call fails
     */
    getRolePermissions: async (): Promise<any[]> => {
        try {
            const result = await api.get(API.ROLE.ROLE_PERMISSION_LIST);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get role permissions list');
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
     * @param id - Role ID
     * @returns Promise that resolves when deletion is complete
     * @throws Error if validation fails or API call fails
     */
    delete: async (id: number): Promise<void> => {
        try {
            validateId(id);
            await api.delete(API.ROLE.DELETE(id));
        } catch (error) {
            handleApiError(error, 'Delete role');
        }
    },
};
