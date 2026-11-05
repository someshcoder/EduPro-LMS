import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    const destination = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
