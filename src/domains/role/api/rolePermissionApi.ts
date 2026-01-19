import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import { ModulePermission, RolePermissionDetail } from '../types/role.types';

// Dummy Data for offline mode
const DUMMY_ROLE_PERMISSIONS: RolePermissionDetail = {
    roleId: 1,
    roleName: 'Administrator',
    roleCode: 'ADMIN',
    modulePermissions: [
        {
            moduleId: 1,
            moduleName: 'Course Management',
            moduleCode: 'MOD_COURSE',
            permissions: [
                { id: 1, code: 'PERM_READ', name: 'Read', isActive: true },
                { id: 2, code: 'PERM_WRITE', name: 'Write', isActive: true },
                { id: 4, code: 'PERM_CREATE', name: 'Create', isActive: true },
                { id: 5, code: 'PERM_UPDATE', name: 'Update', isActive: true },
                { id: 3, code: 'PERM_DELETE', name: 'Delete', isActive: true }
            ],
            assignedPermissionIds: [1, 2, 4, 5]
        },
        {
            moduleId: 2,
            moduleName: 'User Management',
            moduleCode: 'MOD_USER',
            permissions: [
                { id: 1, code: 'PERM_READ', name: 'Read', isActive: true },
                { id: 2, code: 'PERM_WRITE', name: 'Write', isActive: true },
                { id: 4, code: 'PERM_CREATE', name: 'Create', isActive: true },
                { id: 5, code: 'PERM_UPDATE', name: 'Update', isActive: true },
                { id: 3, code: 'PERM_DELETE', name: 'Delete', isActive: true }
            ],
            assignedPermissionIds: [1]
        },
        {
            moduleId: 3,
            moduleName: 'Reporting',
            moduleCode: 'MOD_REPORT',
            permissions: [
                { id: 1, code: 'PERM_READ', name: 'Read', isActive: true },
                { id: 2, code: 'PERM_WRITE', name: 'Write', isActive: true }
            ],
            assignedPermissionIds: [1, 2]
        }
    ]
};

export const rolePermissionApi = {
    /**
     * Get all permissions for a specific role organized by module
     * @param roleId - The role ID to fetch permissions for
     */
    getRolePermissions: async (roleId: number): Promise<RolePermissionDetail> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { ...DUMMY_ROLE_PERMISSIONS, roleId };
        }

        try {
            // Fetch role modules
            const roleModulesResponse = await api.get(API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId));
            const roleModules = roleModulesResponse.data;

            // Fetch all permissions
            const permissionsResponse = await api.get(API.USER_PERMISSIONS.ROLE_MODULE_BY_ID(roleId));
            const allPermissions = permissionsResponse.data;

            // Organize permissions by module
            const modulePermissions: ModulePermission[] = roleModules.map((rm: any) => ({
                moduleId: rm.moduleId,
                moduleName: rm.moduleName,
                moduleCode: rm.moduleCode,
                permissions: allPermissions,
                assignedPermissionIds: rm.permissionIds || []
            }));

            return {
                roleId: roleId,
                roleName: roleModules[0]?.roleName || '',
                roleCode: roleModules[0]?.roleCode || '',
                modulePermissions
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch role permissions');
        }
    },

    /**
     * Update permissions for a role on a specific module
     * @param roleId - The role ID
     * @param moduleId - The module ID
     * @param permissionIds - Array of permission IDs to assign
     */
    updateModulePermissions: async (roleId: number, moduleId: number, permissionIds: number[]): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('Mock: Updated permissions', { roleId, moduleId, permissionIds });
            return;
        }

        try {
            await api.post(API.USER_PERMISSIONS.ASSIGN_PERMISSIONS, {
                roleId,
                moduleId,
                permissionIds
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update module permissions');
        }
    }
};
