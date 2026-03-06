import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { ReactNode } from 'react';
import { usePermission } from '../shared/hooks/usePermission';
import { paths } from './path';

interface PermissionBasedRouteProps {
  /** Module code that the user must have access to (e.g. 'COURSES', 'ROLES') */
  requiredModule?: string;
  /**
   * Specific action the user must be permitted to perform (e.g. 'view', 'create').
   * When omitted, the guard only checks that the user has ANY permission on the module.
   */
  requiredPermission?: string;
  /** Legacy: still accepted so existing usages don't break at compile-time */
  allowedRoles?: string[];
  children?: ReactNode;
}

/**
 * PermissionBasedRoute — route-level permission guard.
 *
 * Wrap a Route's element with this component to protect it:
 *
 *   <PermissionBasedRoute requiredModule="ROLES" requiredPermission="view">
 *     <RolesManagement />
 *   </PermissionBasedRoute>
 *
 * If the user is not authenticated  → redirect to /login
 * If the user lacks the permission  → redirect to /unauthorized
 * Otherwise                         → render children (or <Outlet />)
 */
const PermissionBasedRoute = ({
  requiredModule,
  requiredPermission,
  children,
}: PermissionBasedRouteProps) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const { hasPermission, canView } = usePermission();

  // While the auth state is being rehydrated from storage, show a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all
  if (import.meta.env.MODE !== 'development' && !isAuthenticated) {
    return <Navigate to={paths.auth.login} replace />;
  }

  // No module restriction — let the route through
  if (!requiredModule) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Check actual permission
  const allowed = requiredPermission
    ? hasPermission(requiredModule, requiredPermission)
    : canView(requiredModule);

  if (!allowed) {
    return <Navigate to={paths.web.unauthorized} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PermissionBasedRoute;