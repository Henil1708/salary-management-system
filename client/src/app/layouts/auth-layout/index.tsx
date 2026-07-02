import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('common.appName')}</h1>
      <Outlet />
    </div>
  );
};
