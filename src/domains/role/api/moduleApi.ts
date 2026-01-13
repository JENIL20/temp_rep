import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Module, CreateModuleRequest, AssignPermissionRequest } from '../types/role.types';
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Dummy Data
const DUMMY_MODULES: Module[] = [
    { id: 1, code: 'MOD_COURSE', name: 'Course Management', isActive: true },
    { id: 2, code: 'MOD_USER', name: 'User Management', isActive: true },
    { id: 3, code: 'MOD_REPORT', name: 'Reporting', isActive: true }
];

export const moduleApi = {
    /**
     * List all modules
     */
    listAll: async (): Promise<Module[]> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return DUMMY_MODULES;
        }

        try {
            const response = await api.get<Module[]>(API.USER_PERMISSIONS.MODULES_ALL);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch all modules');
        }
    },

    /**
     * Create a new module
     */
    create: async (data: CreateModuleRequest): Promise<Module> => {
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
            const response = await api.post<Module>(API.USER_PERMISSIONS.MODULES, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create module');
        }
    },

    /**
     * Assign permissions (from a specific module) to a role
     */
    assignPermissions: async (data: AssignPermissionRequest): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('Mock: Assigned permissions', data);
            return;
        }

        try {
            await api.post(API.USER_PERMISSIONS.ASSIGN_PERMISSIONS, data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to assign permissions');
        }
    }
};
