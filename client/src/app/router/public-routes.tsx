import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/store/types';
import { getIsAuthenticated } from '@/features/auth';

// Auth pages bounce an already-authenticated user back into the app
export const PublicRoutes = () => {
  const isAuthenticated = useAppSelector(getIsAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
