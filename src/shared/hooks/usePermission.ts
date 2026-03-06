import { useAppSelector } from '../../store';
import { UserPermissions } from '../../domains/auth/types/auth.types';

interface PermissionCheck {
    module: string;
    permission: string;
}

/**
 * usePermission — central hook for all permission checks.
 *
 * Reads from Redux state.auth.permissions (persisted via redux-persist).
 *
 * Permission codes are lowercase: 'view' | 'create' | 'update' | 'delete'
 * Module codes are UPPER_SNAKE:   'COURSES' | 'USERS' | 'ROLES' | ...
 *
 * Usage:
 *   const { hasPermission, canView, hasAny, hasAll } = usePermission();
 *
 *   hasPermission('COURSES', 'update')  // true if user can update courses
 *   canView('ROLES')                    // true if user has ANY permission on ROLES module
 *   hasAny([{module:'USERS', permission:'create'}, {module:'USERS', permission:'update'}])
 *   hasAll([...])
 */
export const usePermission = () => {
    const permissions: UserPermissions = useAppSelector((state) => state.auth.permissions) ?? {};

    /**
     * Check if user has a specific permission on a module.
     * moduleCode is case-insensitive (normalised to UPPER_SNAKE internally).
     */
    const hasPermission = (moduleCode: string, permissionCode: string): boolean => {
        const normModule = moduleCode.toUpperCase().replace(/\s+/g, '_');
        const normPerm = permissionCode.toLowerCase();
        return permissions[normModule]?.includes(normPerm) ?? false;
    };

    /**
     * True if user has at least one permission on the given module
     * (i.e. they should be able to see the page / nav link).
     */
    const canView = (moduleCode: string): boolean => {
        const normModule = moduleCode.toUpperCase().replace(/\s+/g, '_');
        return (permissions[normModule]?.length ?? 0) > 0;
    };

    /** True if user has at least one of the listed permission checks */
    const hasAny = (checks: PermissionCheck[]): boolean =>
        checks.some(({ module, permission }) => hasPermission(module, permission));

    /** True if user has ALL of the listed permission checks */
    const hasAll = (checks: PermissionCheck[]): boolean =>
        checks.every(({ module, permission }) => hasPermission(module, permission));

    /** Raw permission map — useful for debugging or bulk checks */
    const allPermissions = permissions;

    return { hasPermission, canView, hasAny, hasAll, allPermissions };
};

export default usePermission;
