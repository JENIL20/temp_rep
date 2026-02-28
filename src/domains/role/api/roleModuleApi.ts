import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import { Module } from '../types/role.types';

export interface RoleModuleEntry {
    id: number;       // the RoleModule mapping ID (needed for delete)
    roleId: number;
    moduleId: number;
    moduleName: string;
    moduleCode: string;
}

export const roleModuleApi = {
    /**
     * Get all modules assigned to a specific role
     * GET /api/RoleModules/role/{roleId}
     */
    listByRole: async (roleId: number): Promise<RoleModuleEntry[]> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [
                { id: 1, roleId, moduleId: 1, moduleName: 'Course Management', moduleCode: 'MOD_COURSE' },
                { id: 2, roleId, moduleId: 2, moduleName: 'User Management', moduleCode: 'MOD_USER' },
            ];
        }

        try {
            const res: any = await api.get(API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId));
            const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
            return raw.map((item: any) => ({
                id: item.id,
                roleId: item.roleId,
                moduleId: item.moduleId,
                moduleName: item.moduleName ?? `Module ${item.moduleId}`,
                moduleCode: item.moduleCode ?? `MOD_${item.moduleId}`,
            }));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch role modules');
        }
    },

    /**
     * Assign a module to a role
     * POST /api/RoleModules/create  { roleId, moduleId }
     */
    assign: async (roleId: number, moduleId: number): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('Mock: Assigned module', { roleId, moduleId });
            return;
        }

        try {
            await api.post(API.USER_PERMISSIONS.ROLE_MODULE_CREATE, { roleId, moduleId });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to assign module to role');
        }
    },

    /**
     * Remove a module from a role
     * DELETE /api/RoleModules/delete/{id}  (id = RoleModule mapping ID)
     */
    remove: async (roleModuleId: number): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('Mock: Removed role module', roleModuleId);
            return;
        }

        try {
            await api.delete(API.USER_PERMISSIONS.ROLE_MODULE_DELETE(roleModuleId));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to remove module from role');
        }
    },

    /**
     * Get all available modules
     * GET /api/Modules/list
     */
    listAllModules: async (): Promise<Module[]> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [
                { id: 1, code: 'MOD_COURSE', name: 'Course Management', isActive: true },
                { id: 2, code: 'MOD_USER', name: 'User Management', isActive: true },
                { id: 3, code: 'MOD_REPORT', name: 'Reporting', isActive: true },
                { id: 4, code: 'MOD_CERT', name: 'Certificates', isActive: true },
            ];
        }

        try {
            const res: any = await api.get(API.USER_PERMISSIONS.MODULES_ALL);
            const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
            return raw.map((m: any) => ({
                id: m.id,
                code: m.code ?? m.moduleCode ?? '',
                name: m.name ?? m.moduleName ?? `Module ${m.id}`,
                isActive: m.isActive ?? true,
            }));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch modules');
        }
    },
};
