import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { AssignRoleRequest, Role } from '../types/role.types';
import userApi from '../../user/api/userApi';
import { UserListRequest } from '../../user/types/user.types';
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Mock Roles for users
const DUMMY_USER_ROLES: Role[] = [
    { id: 1, code: 'ADMIN', name: 'Administrator', isActive: true },
    { id: 3, code: 'STUDENT', name: 'Student', isActive: true }
];

/**
 * User Role API Service
 * Handles assigning and removing roles for specific users
 */
export const userRoleApi = {
    /**
     * Assign a role to a user
     */
    assign: async (data: AssignRoleRequest): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('Mock: Assigned role', data);
            return;
        }

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log(`Mock: Removed role ${roleId} from user ${userId}`);
            return;
        }

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return DUMMY_USER_ROLES;
        }

        try {
            const response = await api.get(API.USER_PERMISSIONS.USER_ROLES(userId));
            const data = response.data;

            // API may return a plain Role[] array OR a paginated { items: Role[] } object.
            // Normalise both shapes so assignedRoleIds is always populated correctly.
            let roles: any[] = [];
            if (Array.isArray(data)) {
                roles = data;
            } else if (Array.isArray(data?.items)) {
                roles = data.items;
            }

            // Map defensively: some endpoints return `roleId` instead of `id`
            return roles.map((r: any) => ({
                id: r.id ?? r.roleId,
                code: r.code ?? r.roleCode ?? '',
                name: r.name ?? r.roleName ?? '',
                isActive: r.isActive ?? true
            })) as Role[];
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user roles');
        }
    },

    /**
     * Get user details by ID
     */
    getUserDetails: async (userId: number) => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                id: userId,
                userName: `user_${userId}`,
                email: `user${userId}@example.com`,
                firstName: 'John',
                lastName: 'Doe'
            };
        }

        try {
            const response = await api.get(API.USER.GET_BY_ID(userId));
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user details');
        }
    },

    /**
     * List users with optional pagination (proxied to userApi)
     */
    listUsers: async (params?: UserListRequest) => {
        // userApi handles offline mode internally
        try {
            const data = await userApi.list(params);
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch users');
        }
    }
};
