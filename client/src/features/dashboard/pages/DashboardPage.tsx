import { useTranslation } from 'react-i18next';

// Placeholder — stat tiles, dimension charts, pay bands and the recent-changes
// feed land with the dashboard feature PR (blueprint step 5, issue #14)
const DashboardPage = () => {
  const { t } = useTranslation();

  return <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h1>;
};

export default DashboardPage;
