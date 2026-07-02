import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Upload, Users } from 'lucide-react';
import { useAppSelector } from '@/app/store/types';
import { getCurrentUser } from '@/features/auth';
import { cn } from '@/shared/utils/cn';

const navItems = [
  { to: '/', labelKey: 'dashboard.title', icon: LayoutDashboard, end: true },
  { to: '/employees', labelKey: 'employee.directory.title', icon: Users, end: false },
  { to: '/import', labelKey: 'import.title', icon: Upload, end: false },
];

export const DashboardLayout = () => {
  const { t } = useTranslation();
  const user = useAppSelector(getCurrentUser);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-muted/20">
        <div className="flex h-14 items-center border-b px-4 font-semibold tracking-tight">
          {t('common.appName')}
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b px-6">
          {user && (
            <div className="text-right text-sm">
              <div className="font-medium">{user.username}</div>
              <div className="text-xs text-muted-foreground">{user.designation}</div>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
