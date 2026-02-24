import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import { ModulePermission, RolePermissionDetail } from '../types/role.types';
import { moduleApi } from './moduleApi';
import { permissionApi } from './permissionApi';

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
            // Fetch role modules for this role
            const roleModulesResponse = await api.get(API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId));
            const roleModules = Array.isArray(roleModulesResponse.data) ? roleModulesResponse.data : [];


            // Fetch all available permissions and modules in parallel
            const [allPermissions, allModules] = await Promise.all([
                permissionApi.list(),
                moduleApi.listAll()
            ]);

            // Build module permissions structure using the dedicated per-module endpoint
            // so that assigned permission IDs are always accurate after every save.
            const modulePermissions: ModulePermission[] = await Promise.all(
                roleModules.map(async (rm: any) => {
                    // Find the module details
                    const moduleDetails = allModules.find((m: any) => m.id === rm.moduleId) || {
                        id: rm.moduleId,
                        code: rm.moduleCode || `MOD_${rm.moduleId}`,
                        name: rm.moduleName || `Module ${rm.moduleId}`,
                        isActive: true
                    };

                    // Use the dedicated endpoint GET /api/user-permissions/role-module/{roleId}/{moduleId}/permissions
                    // This is accurate on every fetch (not affected by pagination or stale list results).
                    let assignedPerms: number[] = [];
                    try {
                        const permsResponse = await api.get(
                            API.USER_PERMISSIONS.ROLE_MODULE_PERMISSIONS_BY_ROLE_MODULE(roleId, rm.moduleId)
                        );
                        const permsData = permsResponse.data;
                        if (Array.isArray(permsData)) {
                            assignedPerms = permsData
                                .map((p: any) => p.permissionId ?? p.id)
                                .filter((id: any) => id !== undefined && id !== null);
                        } else if (Array.isArray(permsData?.items)) {
                            assignedPerms = permsData.items
                                .map((p: any) => p.permissionId ?? p.id)
                                .filter((id: any) => id !== undefined && id !== null);
                        }
                    } catch {
                        // If the per-module endpoint fails fall back to empty — don't crash the whole page
                        assignedPerms = [];
                    }

                    return {
                        moduleId: rm.moduleId,
                        moduleName: moduleDetails.name,
                        moduleCode: moduleDetails.code,
                        permissions: allPermissions,
                        assignedPermissionIds: assignedPerms
                    };
                })
            );

            // Get role details from the first role module or fetch separately
            let roleName = 'Unknown Role';
            let roleCode = 'UNKNOWN';

            if (roleModules.length > 0) {
                roleName = roleModules[0].roleName || roleName;
                roleCode = roleModules[0].roleCode || roleCode;
            }

            return {
                roleId: roleId,
                roleName,
                roleCode,
                modulePermissions
            };
        } catch (error: any) {
            console.error('Error fetching role permissions:', error);
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
