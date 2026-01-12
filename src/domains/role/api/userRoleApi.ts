import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { AssignRoleRequest, Role } from '../types/role.types';
import userApi from '../../user/api/userApi';
import { UserListRequest } from '../../user/types/user.types';

/**
 * User Role API Service
 * Handles assigning and removing roles for specific users
 */
export const userRoleApi = {
    /**
     * Assign a role to a user
     */
    assign: async (data: AssignRoleRequest): Promise<void> => {
        try {
            await api.post(API.USER_PERMISSIONS.ASSIGN_ROLE, data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to assign role to user');
        }
    },

    /**
     * Remove a role from a user
     */
    remove: async (userId: number, roleId: number): Promise<void> => {
        try {
            await api.delete(API.USER_PERMISSIONS.REMOVE_USER_ROLE(userId, roleId));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to remove role from user');
        }
    },

    /**
     * Get all roles assigned to a specific user
     */
    getUserRoles: async (userId: number): Promise<Role[]> => {
        try {
            const response = await api.get<Role[]>(API.USER_PERMISSIONS.USER_PERMISSIONS(userId));
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user roles');
        }
    },

    /**
     * List users with optional pagination (proxied to userApi)
     */
    listUsers: async (params?: UserListRequest) => {
        try {
            const data = await userApi.list(params);
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch users');
        }
    }
};
