import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Permission } from '../types/role.types';
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Dummy Data
const DUMMY_PERMISSIONS: Permission[] = [
    { id: 1, code: 'PERM_READ', name: 'Read', isActive: true },
    { id: 2, code: 'PERM_WRITE', name: 'Write', isActive: true },
    { id: 3, code: 'PERM_DELETE', name: 'Delete', isActive: true }
];

export const permissionApi = {
    /**
     * List all available permissions
     */
    list: async (): Promise<Permission[]> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return DUMMY_PERMISSIONS;
        }

        try {
            const response = await api.get<Permission[]>(API.USER_PERMISSIONS.PERMISSIONS);
            // The swagger says it has SearchTerm, PageNumber, etc as query params, but we'll start with a basic fetch.
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
        }
    }
};
