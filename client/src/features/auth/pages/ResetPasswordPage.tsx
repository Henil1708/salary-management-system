import { useTranslation } from 'react-i18next';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

const ResetPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('auth.resetPassword.title')}</h1>
      </div>
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage;
