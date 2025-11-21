import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';

/**
 * PublicRoute - For pages like Login/Register
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render login/register pages
  return <Outlet />;
};

export default PublicRoute;
