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
  getPayrollTrend,
  getRecentChanges,
  getSummary,
} from '@/features/dashboard';
import { ChartCardSkeleton, StatCardSkeleton } from '@/shared/components/feedback/skeletons';
import { DepartmentDonut } from '../components/DepartmentDonut';
import { PayrollTrendChart } from '../components/PayrollTrendChart';
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
  const payrollTrend = useAppSelector(getPayrollTrend);
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
        {!summary ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={<Users />}
              iconClassName="bg-indigo-100 text-indigo-600"
              title={t('dashboard.cards.totalEmployees')}
              value={formatNumber(summary.headcount)}
              caption={t('dashboard.cards.activeCaption', { count: summary.activeHeadcount })}
            />
            <StatCard
              icon={<Wallet />}
              iconClassName="bg-emerald-100 text-emerald-600"
              title={t('dashboard.cards.averageSalary')}
              value={formatCurrency(summary.averageSalaryUsd)}
              caption={t('dashboard.cards.medianCaption', {
                value: formatCurrency(summary.medianSalaryUsd),
              })}
            />
            <StatCard
              icon={<DollarSign />}
              iconClassName="bg-sky-100 text-sky-600"
              title={t('dashboard.cards.totalPayroll')}
              value={formatCurrency(summary.totalPayrollCostUsd, 'USD', { compact: true })}
              caption={t('dashboard.cards.normalizedCaption')}
            />
            <StatCard
              icon={<Globe />}
              iconClassName="bg-amber-100 text-amber-600"
              title={t('dashboard.cards.countries')}
              value={formatNumber(COUNTRIES.length)}
              caption={t('dashboard.cards.currenciesCaption', { count: CURRENCY_CODES.length })}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {payrollTrend.length > 0 ? (
            <PayrollTrendChart data={payrollTrend} />
          ) : (
            <ChartCardSkeleton />
          )}
        </div>
        {departmentStats && summary ? (
          <DepartmentDonut rows={departmentStats} totalHeadcount={summary.activeHeadcount} />
        ) : (
          <ChartCardSkeleton height={320} />
        )}
      </div>

      <SalaryByDimensionChart />

      <div className="grid gap-4 lg:grid-cols-2">
        {countryStats ? <PayrollByCountry rows={countryStats} /> : <ChartCardSkeleton />}
        {recentChanges.length > 0 ? (
          <RecentChangesList rows={recentChanges} />
        ) : (
          <ChartCardSkeleton />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
