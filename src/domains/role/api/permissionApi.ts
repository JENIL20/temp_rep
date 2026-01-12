import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Permission } from '../types/role.types';

export const permissionApi = {
    /**
     * List all available permissions
     */
    list: async (): Promise<Permission[]> => {
        try {
            const response = await api.get<Permission[]>(API.USER_PERMISSIONS.PERMISSIONS);
            // The swagger says it has SearchTerm, PageNumber, etc as query params, but we'll start with a basic fetch.
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
        }
    }
};
