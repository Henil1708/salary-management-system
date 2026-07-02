import { useTranslation } from 'react-i18next';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('auth.forgotPassword.title')}</h1>
      </div>
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;
