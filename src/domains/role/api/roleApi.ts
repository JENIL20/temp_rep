import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Role, CreateRoleRequest } from '../types/role.types';
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Dummy data for offline mode
const DUMMY_ROLES: Role[] = [
    { id: 1, name: 'Admin', code: 'admin', isActive: true },
    { id: 2, name: 'Instructor', code: 'instructor', isActive: true },
    { id: 3, name: 'Student', code: 'student', isActive: true }
];

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
     * Create a new role
     */
    create: async (data: CreateRoleRequest): Promise<Role> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const newRole: Role = {
                id: Math.floor(Math.random() * 1000) + 10,
                name: data.name,
                code: data.code,
                isActive: true
            };
            DUMMY_ROLES.push(newRole);
            return newRole;
        }

        try {
            const response = await api.post<Role>(API.USER_PERMISSIONS.ROLE_CREATE, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create role');
        }
    },

    /**
     * Update a role
     */
    update: async (id: number, data: Partial<CreateRoleRequest>): Promise<Role> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const index = DUMMY_ROLES.findIndex(r => r.id === id);
            if (index !== -1) {
                DUMMY_ROLES[index] = { ...DUMMY_ROLES[index], ...data };
                return DUMMY_ROLES[index];
            }
            throw new Error('Role not found');
        }

        try {
            validateId(id);
            const response = await api.put<Role>(API.USER_PERMISSIONS.ROLE_UPDATE(id), data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update role');
        }
    },

    /**
     * Start of Get role permissions list - Placeholder implementation as the specific endpoint needs verification
     * @returns Promise with array of role permissions
     */
    getRolePermissions: async (): Promise<any[]> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [];
        }

        try {
            const response = await api.get<any[]>(API.USER_PERMISSIONS.PERMISSIONS);
            return response.data;
        } catch (error: any) {
            // handleApiError(error, 'Failed to fetch role permissions'); // Swallow error to avoid blocking?
            console.error('Failed to fetch role permissions', error);
            return [];
        }
    },

    /**
     * Get role by ID
     * @param id - Role ID
     * @returns Promise with role details
     * @throws Error if validation fails or API call fails
     */
    getById: async (id: number): Promise<Role> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const role = DUMMY_ROLES.find(r => r.id === id);
            if (!role) throw new Error('Role not found');
            return role;
        }

        try {
            validateId(id);
            const response = await api.get(API.USER_PERMISSIONS.ROLE_BY_ID(id));
            if (!response) throw new Error('Role not found');
            return response.data;
        } catch (error) {
            handleApiError(error, 'Get role by ID');
        }
    },

    /**
     * Delete a role
     */
    delete: async (id: number): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const index = DUMMY_ROLES.findIndex(r => r.id === id);
            if (index !== -1) {
                DUMMY_ROLES.splice(index, 1);
            }
            return;
        }

        try {
            validateId(id);
            await api.delete(API.USER_PERMISSIONS.ROLE_DELETE(id));
        } catch (error) {
            handleApiError(error, 'Delete role');
        }
    }
};
