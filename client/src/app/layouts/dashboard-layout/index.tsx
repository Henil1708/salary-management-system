import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, LogOut, Upload, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

const navItems = [
  { to: '/', labelKey: 'dashboard.title', icon: LayoutDashboard, end: true },
  { to: '/employees', labelKey: 'employee.directory.title', icon: Users, end: false },
  { to: '/import', labelKey: 'import.title', icon: Upload, end: false },
];

const userInitials = (username: string): string => username.slice(0, 2).toUpperCase();

export const DashboardLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* dark navy sidebar per the product mockup */}
      <aside className="flex w-64 flex-col bg-indigo-950 text-indigo-100">
        <div className="flex items-center gap-3 px-5 py-6">
          <Users className="h-9 w-9 text-indigo-300" strokeWidth={2.2} />
          <div>
            <div className="text-lg font-bold tracking-tight text-white">
              {t('common.brandName')}
            </div>
            <div className="text-xs text-indigo-300">{t('common.brandTagline')}</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {navItems.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-indigo-200/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-indigo-200/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col bg-muted/30">
        <header className="flex h-16 items-center justify-end border-b bg-background px-6">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {userInitials(user.username)}
              </div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user.designation}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
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
