import { useTranslation } from 'react-i18next';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('auth.forgotPassword.title')}</h1>
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;
