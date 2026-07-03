import { useTranslation } from 'react-i18next';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

const ResetPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('auth.resetPassword.title')}</h1>
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage;
