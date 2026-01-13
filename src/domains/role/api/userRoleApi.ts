import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { AssignRoleRequest, Role } from '../types/role.types';
import userApi from '../../user/api/userApi';
import { UserListRequest } from '../../user/types/user.types';
<<<<<<< HEAD
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Mock Roles for users
const DUMMY_USER_ROLES: Role[] = [
    { id: 1, code: 'ADMIN', name: 'Administrator', isActive: true },
    { id: 3, code: 'STUDENT', name: 'Student', isActive: true }
];
=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093

/**
 * User Role API Service
 * Handles assigning and removing roles for specific users
 */
export const userRoleApi = {
    /**
     * Assign a role to a user
     */
    assign: async (data: AssignRoleRequest): Promise<void> => {
<<<<<<< HEAD
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('Mock: Assigned role', data);
            return;
        }

=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
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
<<<<<<< HEAD
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log(`Mock: Removed role ${roleId} from user ${userId}`);
            return;
        }

=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
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
<<<<<<< HEAD
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            // Just return dummy roles for any user for now
            return DUMMY_USER_ROLES;
        }

=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
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
<<<<<<< HEAD
        // userApi handles offline mode internally
=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
        try {
            const data = await userApi.list(params);
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch users');
        }
    }
};
