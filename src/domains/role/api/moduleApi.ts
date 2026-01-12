import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Module, CreateModuleRequest, AssignPermissionRequest } from '../types/role.types';

export const moduleApi = {
    /**
     * List all modules
     */
    listAll: async (): Promise<Module[]> => {
        try {
            const response = await api.get<Module[]>(API.USER_PERMISSIONS.MODULES_ALL);
            console.log("Fetched modules:", response.data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch all modules');
        }
    },

    /**
     * Create a new module
     */
    create: async (data: CreateModuleRequest): Promise<Module> => {
        try {
            const response = await api.post<Module>(API.USER_PERMISSIONS.MODULES, data);
            console.log("Created module:", response.data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create module');
        }
    },

    /**
     * Assign permissions (from a specific module) to a role
     */
    assignPermissions: async (data: AssignPermissionRequest): Promise<void> => {
        try {
            const temp = await api.post(API.USER_PERMISSIONS.ASSIGN_PERMISSIONS, data);
            console.log("Assigned permissions:", temp.data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to assign permissions');
        }
    }
};
