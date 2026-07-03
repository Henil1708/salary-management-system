import { lazy, Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/auth-layout';
import { DashboardLayout } from '@/app/layouts/dashboard-layout';
import { PrivateRoutes } from './private-routes';
import { PublicRoutes } from './public-routes';

// Route-level pages are lazy — each feature ships as its own chunk
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const EmployeeDirectoryPage = lazy(
  () => import('@/features/employees/pages/EmployeeDirectoryPage')
);
const EmployeeProfilePage = lazy(() => import('@/features/employees/pages/EmployeeProfilePage'));
const SalariesPage = lazy(() => import('@/features/salaries/pages/SalariesPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

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
        children: [
          { path: '/login', element: withSuspense(<LoginPage />) },
          { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
          { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
        ],
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
          { path: '/employees', element: withSuspense(<EmployeeDirectoryPage />) },
          { path: '/employees/:id', element: withSuspense(<EmployeeProfilePage />) },
          { path: '/salaries', element: withSuspense(<SalariesPage />) },
          { path: '/users', element: withSuspense(<UsersPage />) },
          { path: '/settings', element: withSuspense(<SettingsPage />) },
          // /import registers here as the feature lands
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
