import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Permission, CreatePermissionRequest } from '../types/role.types';

/**
 * API Error Handler
 * Provides consistent error handling across all API calls
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[PermissionAPI Error - ${context}]:`, error);

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
 * Validates permission ID
 */
const validateId = (id: number): void => {
    if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Valid permission ID is required');
    }
};

/**
 * Validates permission request data
 */
const validatePermissionRequest = (data: CreatePermissionRequest): void => {
    if (!data) {
        throw new Error('Permission data is required');
    }
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error('Permission name is required');
    }
    if (data.name.trim().length > 100) {
        throw new Error('Permission name must be 100 characters or less');
    }
    if (data.description && typeof data.description !== 'string') {
        throw new Error('Permission description must be a string');
    }
};

export const permissionApi = {
    /**
     * List all permissions
     * @returns Promise with array of all permissions
     * @throws Error if API call fails
     */
    list: async (): Promise<Permission[]> => {
        try {
            const result = await api.get(API.PERMISSION.LIST);

            if (!result) {
                console.warn('[PermissionAPI] No permissions data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'List permissions');
        }
    },

    /**
     * Get permission by ID
     * @param id - Permission ID
     * @returns Promise with permission details
     * @throws Error if validation fails or API call fails
     */
    getById: async (id: number): Promise<Permission> => {
        try {
            validateId(id);
            const result = await api.get(API.PERMISSION.GET_BY_ID(id));

            if (!result) {
                throw new Error('No permission data returned');
            }

            return result as Permission;
        } catch (error) {
            handleApiError(error, 'Get permission by ID');
        }
    },

    /**
     * Create a new permission
     * @param data - Permission creation request
     * @returns Promise with created permission
     * @throws Error if validation fails or API call fails
     */
    create: async (data: CreatePermissionRequest): Promise<Permission> => {
        try {
            validatePermissionRequest(data);

            // Sanitize data
            const sanitizedData = {
                ...data,
                name: data.name.trim(),
                description: data.description?.trim() || '',
            };

            const result = await api.post(API.PERMISSION.CREATE, sanitizedData);

            if (!result) {
                throw new Error('No permission data returned after creation');
            }

            return result as Permission;
        } catch (error) {
            handleApiError(error, 'Create permission');
        }
    },

    /**
     * Update an existing permission
     * @param id - Permission ID
     * @param data - Permission update request
     * @returns Promise with updated permission
     * @throws Error if validation fails or API call fails
     */
    update: async (id: number, data: CreatePermissionRequest): Promise<Permission> => {
        try {
            validateId(id);
            validatePermissionRequest(data);

            // Sanitize data
            const sanitizedData = {
                ...data,
                name: data.name.trim(),
                description: data.description?.trim() || '',
            };

            const result = await api.put(API.PERMISSION.UPDATE(id), sanitizedData);

            if (!result) {
                throw new Error('No permission data returned after update');
            }

            return result as Permission;
        } catch (error) {
            handleApiError(error, 'Update permission');
        }
    },

    /**
     * Delete a permission
     * @param id - Permission ID
     * @returns Promise that resolves when deletion is complete
     * @throws Error if validation fails or API call fails
     */
    delete: async (id: number): Promise<void> => {
        try {
            validateId(id);
            await api.delete(API.PERMISSION.DELETE(id));
        } catch (error) {
            handleApiError(error, 'Delete permission');
        }
    },
};
