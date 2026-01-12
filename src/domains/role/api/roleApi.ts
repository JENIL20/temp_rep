import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Role, CreateRoleRequest, UpdateRoleRequest, RoleModule } from '../types/role.types';

/**
 * Role API Service
 * Handles CRUD operations for Roles based on User Permissions schema
 */
export const roleApi = {
    /**
     * List all roles
     */
    list: async (): Promise<Role[]> => {
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
        try {
            const response = await api.post<Role>(API.USER_PERMISSIONS.ROLES, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create role');
        }
    },

    /**
     * Update an existing role
     */
    update: async (id: number, data: UpdateRoleRequest): Promise<Role> => {
        try {
            const response = await api.put<Role>(API.USER_PERMISSIONS.ROLE_BY_ID(id), data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update role');
        }
    },

    /**
     * Delete a role
     */
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(API.USER_PERMISSIONS.ROLE_BY_ID(id));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete role');
        }
    },

    /**
     * List modules associated with a specific role
     */
    getRoleModules: async (roleId: number): Promise<RoleModule[]> => {
        try {
            const response = await api.get<RoleModule[]>(API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId));
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch role modules');
        }
    }
};
