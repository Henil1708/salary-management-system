import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  UserCog,
  Users,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

const navItems = [
  { to: '/', labelKey: 'dashboard.title', icon: LayoutDashboard, end: true },
  { to: '/employees', labelKey: 'employee.nav', icon: Users, end: false },
  { to: '/salaries', labelKey: 'salaries.nav', icon: DollarSign, end: false },
  { to: '/import', labelKey: 'import.title', icon: Upload, end: false },
  { to: '/users', labelKey: 'users.nav', icon: UserCog, end: false },
  { to: '/settings', labelKey: 'settings.nav', icon: Settings, end: false },
];

const userInitials = (username: string): string => username.slice(0, 2).toUpperCase();

export const DashboardLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    // shell is exactly the viewport height; only <main> scrolls
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* light sidebar per the product mockup — full height, never scrolls */}
      <aside className="flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <div>
            <div className="text-lg font-bold tracking-tight">{t('common.brandName')}</div>
            <div className="text-xs text-muted-foreground">{t('common.brandTagline')}</div>
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
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-3 py-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end border-b bg-background px-6">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="font-medium leading-tight">{user.designation}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {userInitials(user.username)}
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
