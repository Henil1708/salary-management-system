import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">{t('auth.login.subtitle')}</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
