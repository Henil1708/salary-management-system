import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AuthIllustration } from './auth-illustration';

// shadcn login-04 pattern: one wide card, form column on the left, cover
// illustration on the right (hidden on small screens). Shared by all auth
// pages — the Outlet renders each page's heading + form.
export const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <Card className="overflow-hidden">
          <CardContent className="grid min-h-[520px] p-0 md:grid-cols-2">
            <div className="flex flex-col justify-center p-6 md:p-10">
              <div className="mb-8 text-center text-lg font-semibold tracking-tight">
                {t('common.appName')}
              </div>
              <Outlet />
            </div>
            <div className="relative hidden bg-muted md:block">
              <AuthIllustration />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
