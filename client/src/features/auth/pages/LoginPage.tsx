import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

// Shell only — the Formik login form (shared loginSchema) lands with the
// auth feature PR (blueprint step 2, GitHub issue #14)
const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('auth.login.title')}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  );
};

export default LoginPage;
