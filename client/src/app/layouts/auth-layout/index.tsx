import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import authCover from '@/assets/images/auth-cover.jpg';

// shadcn login-04 pattern: one wide card, form column on the left with the
// brand block top-left, cover image on the right (hidden on small screens).
// Shared by all auth pages — the Outlet renders each page's heading + form.
export const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <Card className="overflow-hidden">
          <CardContent className="grid min-h-[620px] p-0 md:grid-cols-2">
            <div className="flex flex-col p-6 md:p-10">
              <div className="flex items-center gap-3">
                <Users className="h-9 w-9 text-primary" strokeWidth={2.2} />
                <div>
                  <div className="text-xl font-bold tracking-tight">{t('common.brandName')}</div>
                  <div className="text-xs text-muted-foreground">{t('common.brandTagline')}</div>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center py-10">
                <Outlet />
              </div>
            </div>
            <div className="relative hidden bg-muted md:block">
              <img
                src={authCover}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
