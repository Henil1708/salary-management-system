import { useTranslation } from 'react-i18next';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { ProfileForm } from '../components/ProfileForm';

const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-0.5 text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
};

export default SettingsPage;
