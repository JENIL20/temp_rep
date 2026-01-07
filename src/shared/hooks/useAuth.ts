import { useAppSelector } from '../store';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    isUser: user?.role === 'user',
  };
};
