import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Role, CreateRoleRequest, UpdateRoleRequest, RoleModule } from '../types/role.types';
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Dummy Data
const DUMMY_ROLES: Role[] = [
    { id: 1, code: 'ADMIN', name: 'Administrator', isActive: true },
    { id: 2, code: 'INSTRUCTOR', name: 'Instructor', isActive: true },
    { id: 3, code: 'STUDENT', name: 'Student', isActive: true }
];

const DUMMY_ROLE_MODULES: RoleModule[] = [
    { id: 1, roleId: 1, roleName: 'Administrator', moduleId: 1, moduleName: 'Course Management', moduleCode: 'MOD_COURSE' },
    { id: 2, roleId: 1, roleName: 'Administrator', moduleId: 2, moduleName: 'User Management', moduleCode: 'MOD_USER' }
];

/**
 * Role API Service
 * Handles CRUD operations for Roles based on User Permissions schema
 */
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
            return {
                id: Math.floor(Math.random() * 1000),
                code: data.code,
                name: data.name,
                isActive: true
            };
        }

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const role = DUMMY_ROLES.find(r => r.id === id);
            return role ? { ...role, name: data.name } : { id, code: 'UNKNOWN', name: data.name, isActive: true };
        }

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log(`Mock deleted role ${id}`);
            return;
        }

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
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return DUMMY_ROLE_MODULES.filter(rm => rm.roleId === roleId);
        }

        try {
            const response = await api.get<RoleModule[]>(API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId));
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch role modules');
        }
    }
};
