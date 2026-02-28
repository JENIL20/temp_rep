import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import { ModulePermission, Permission, RolePermissionDetail } from '../types/role.types';

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
     * Get all permissions for a specific role organized by module.
     * - Available permissions per module: /api/module-permissions/list?ModuleId={id}
     * - Assigned permissions per role+module: /api/role-module-permissions/list?RoleId={r}&ModuleId={m}
     */
    getRolePermissions: async (roleId: number): Promise<RolePermissionDetail> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { ...DUMMY_ROLE_PERMISSIONS, roleId };
        }

        try {
            // 1. Fetch modules assigned to this role
            const roleModulesRes: any = await api.get(API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId));
            const roleModules = Array.isArray(roleModulesRes)
                ? roleModulesRes
                : Array.isArray(roleModulesRes?.data)
                    ? roleModulesRes.data
                    : [];

            // 2. For each role-module, fetch BOTH the available permissions for that module
            //    AND the permissions already assigned to this role for that module — in parallel.
            const modulePermissions: ModulePermission[] = await Promise.all(
                roleModules.map(async (rm: any) => {

                    // --- Available permissions for this module ---
                    let availablePermissions: Permission[] = [];
                    try {
                        const availRes: any = await api.get(
                            API.USER_PERMISSIONS.MODULE_PERMISSIONS_BY_MODULE(rm.moduleId)
                        );
                        // Handle both direct array and { data: [...] } or { items: [...] }
                        const rawList = Array.isArray(availRes)
                            ? availRes
                            : Array.isArray(availRes?.data)
                                ? availRes.data
                                : Array.isArray(availRes?.items)
                                    ? availRes.items
                                    : [];

                        availablePermissions = rawList
                            .filter((p: any) => p !== null && p !== undefined)
                            .map((p: any) => ({
                                id: p.permissionId ?? p.id,
                                code: p.permissionCode ?? p.code ?? '',
                                name: p.permissionName ?? p.name ?? `Permission ${p.permissionId ?? p.id}`,
                                isActive: p.isActive ?? true,
                            }))
                            .filter((p: Permission) => p.id !== undefined && p.id !== null);
                    } catch {
                        availablePermissions = [];
                    }

                    // --- Already-assigned permissions for this role+module ---
                    let assignedPermissionIds: number[] = [];
                    try {
                        const assignedRes: any = await api.get(
                            API.USER_PERMISSIONS.ROLE_MODULE_PERMISSIONS_BY_ROLE_AND_MODULE(roleId, rm.moduleId)
                        );
                        // Handle both direct array and { data: [...] } or { items: [...] }
                        const rawAssigned = Array.isArray(assignedRes)
                            ? assignedRes
                            : Array.isArray(assignedRes?.data)
                                ? assignedRes.data
                                : Array.isArray(assignedRes?.items)
                                    ? assignedRes.items
                                    : [];

                        assignedPermissionIds = rawAssigned
                            .map((p: any) => p.permissionId ?? p.id)
                            .filter((id: any) => id !== undefined && id !== null);
                    } catch {
                        // fallback: try the old per-module endpoint
                        try {
                            const permsRes: any = await api.get(
                                API.USER_PERMISSIONS.ROLE_MODULE_PERMISSIONS_BY_ROLE_MODULE(roleId, rm.moduleId)
                            );
                            const permsData = Array.isArray(permsRes) ? permsRes : permsRes?.data || permsRes?.items || [];
                            if (Array.isArray(permsData)) {
                                assignedPermissionIds = permsData
                                    .map((p: any) => p.permissionId ?? p.id)
                                    .filter((id: any) => id !== undefined && id !== null);
                            }
                        } catch {
                            assignedPermissionIds = [];
                        }
                    }

                    return {
                        moduleId: rm.moduleId,
                        moduleName: rm.moduleName || `Module ${rm.moduleId}`,
                        moduleCode: rm.moduleCode || `MOD_${rm.moduleId}`,
                        permissions: availablePermissions,
                        assignedPermissionIds,
                    } satisfies ModulePermission;
                })
            );

            // 3. Derive role name / code from the first role-module entry
            const roleName = roleModules[0]?.roleName ?? 'Unknown Role';
            const roleCode = roleModules[0]?.roleCode ?? 'UNKNOWN';

            return { roleId, roleName, roleCode, modulePermissions };
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
