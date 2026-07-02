import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/store/types';
import { getAuthStatus } from '@/features/auth';

export const PrivateRoutes = () => {
  const status = useAppSelector(getAuthStatus);
  const location = useLocation();

  // session restore still running on boot — don't bounce to login prematurely
  if (status === 'restoring') {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">…</div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
