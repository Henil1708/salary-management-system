import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('auth.login.title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('auth.login.subtitle')}</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
