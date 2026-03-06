import { useAppSelector } from '../../store';
import { usePermission } from './usePermission';

/**
 * useAuth — convenience hook that combines auth state + permission helpers.
 */
export const useAuth = () => {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const { hasPermission, canView, hasAny, hasAll, allPermissions } = usePermission();

  return {
    user,
    isAuthenticated,
    loading,
    // Legacy role checks (based on user.roles string array)
    isAdmin: user?.roles?.includes('Admin') ?? false,
    isModerator: user?.roles?.includes('Moderator') ?? false,
    isStudent: user?.roles?.includes('Student') ?? false,
    // Permission-based checks (module+action)
    hasPermission,
    canView,
    hasAny,
    hasAll,
    allPermissions,
  };
};
