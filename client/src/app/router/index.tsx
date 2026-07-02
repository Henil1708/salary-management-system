import { lazy, Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/auth-layout';
import { DashboardLayout } from '@/app/layouts/dashboard-layout';
import { PrivateRoutes } from './private-routes';
import { PublicRoutes } from './public-routes';

// Route-level pages are lazy — each feature ships as its own chunk
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));

const withSuspense = (node: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="flex min-h-32 items-center justify-center text-muted-foreground">…</div>
    }
  >
    {node}
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/login', element: withSuspense(<LoginPage />) }],
      },
    ],
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: withSuspense(<DashboardPage />) },
          // /employees, /employees/:id, /import register here as features land
        ],
      },
    ],
  },
]);

// future flag: opt in to v7's startTransition wrapping now — silences the
// upgrade warning and matches the behavior we'll get on React Router 7
export const AppRouter = () => (
  <RouterProvider router={router} future={{ v7_startTransition: true }} />
);
