import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Globe, Users, Wallet } from 'lucide-react';
import { COUNTRIES, CURRENCY_CODES } from '@salary/shared';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { useAuth } from '@/features/auth';
import { formatCurrency, formatNumber } from '@/shared/utils/format';
import {
  fetchDashboard,
  getDimensionStats,
  getRecentChanges,
  getSummary,
} from '@/features/dashboard';
import { DepartmentDonut } from '../components/DepartmentDonut';
import { PayrollByCountry } from '../components/PayrollByCountry';
import { RecentChangesList } from '../components/RecentChangesList';
import { SalaryByDimensionChart } from '../components/SalaryByDimensionChart';
import { StatCard } from '../components/StatCard';

const DashboardPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const summary = useAppSelector(getSummary);
  const departmentStats = useAppSelector(getDimensionStats('department'));
  const countryStats = useAppSelector(getDimensionStats('country'));
  const recentChanges = useAppSelector(getRecentChanges);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="mt-0.5 text-muted-foreground">
          {t('dashboard.welcome', { name: user?.designation ?? user?.username ?? '' })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users />}
          iconClassName="bg-indigo-100 text-indigo-600"
          title={t('dashboard.cards.totalEmployees')}
          value={summary ? formatNumber(summary.headcount) : '—'}
          caption={
            summary
              ? t('dashboard.cards.activeCaption', { count: summary.activeHeadcount })
              : undefined
          }
        />
        <StatCard
          icon={<Wallet />}
          iconClassName="bg-emerald-100 text-emerald-600"
          title={t('dashboard.cards.averageSalary')}
          value={summary ? formatCurrency(summary.averageSalaryUsd) : '—'}
          caption={
            summary
              ? t('dashboard.cards.medianCaption', {
                  value: formatCurrency(summary.medianSalaryUsd),
                })
              : undefined
          }
        />
        <StatCard
          icon={<DollarSign />}
          iconClassName="bg-sky-100 text-sky-600"
          title={t('dashboard.cards.totalPayroll')}
          value={
            summary ? formatCurrency(summary.totalPayrollCostUsd, 'USD', { compact: true }) : '—'
          }
          caption={summary ? t('dashboard.cards.normalizedCaption') : undefined}
        />
        <StatCard
          icon={<Globe />}
          iconClassName="bg-amber-100 text-amber-600"
          title={t('dashboard.cards.countries')}
          value={formatNumber(COUNTRIES.length)}
          caption={t('dashboard.cards.currenciesCaption', { count: CURRENCY_CODES.length })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SalaryByDimensionChart />
        {departmentStats && summary && (
          <DepartmentDonut rows={departmentStats} totalHeadcount={summary.activeHeadcount} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {countryStats && <PayrollByCountry rows={countryStats} />}
        {recentChanges.length > 0 && <RecentChangesList rows={recentChanges} />}
      </div>
    </div>
  );
};

export default DashboardPage;
