import { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';

interface PermissionGateProps {
    /** Module code, e.g. 'COURSES', 'USERS', 'ROLES' (case-insensitive) */
    module: string;
    /**
     * Specific permission to check, e.g. 'view' | 'create' | 'update' | 'delete'.
     * If omitted, the gate passes as long as the user has ANY permission on the module.
     */
    permission?: string;
    /** Content rendered when the user has permission */
    children: ReactNode;
    /**
     * Content rendered when the user does NOT have permission.
     * Defaults to null (renders nothing).
     */
    fallback?: ReactNode;
}

/**
 * PermissionGate — Conditionally renders children based on the user's permissions.
 *
 * Examples:
 *
 *   // Hides "Edit" button if user cannot update courses
 *   <PermissionGate module="COURSE_MANAGEMENT" permission="update">
 *     <button>Edit Course</button>
 *   </PermissionGate>
 *
 *   // Hides entire section; shows "Access Denied" if no view permission
 *   <PermissionGate module="REPORT_MANAGEMENT" fallback={<p>Access denied</p>}>
 *     <ReportsSection />
 *   </PermissionGate>
 */
const PermissionGate = ({
    module,
    permission,
    children,
    fallback = null,
}: PermissionGateProps) => {
    const { hasPermission, canView } = usePermission();

    const allowed = permission
        ? hasPermission(module, permission)
        : canView(module);

    return allowed ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
