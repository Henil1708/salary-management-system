import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DASHBOARD_DIMENSIONS, DashboardDimension } from '@salary/shared';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { formatCurrency, formatNumber } from '@/shared/utils/format';
import { fetchDimension, getDashboardRange, getDimensionStats } from '@/features/dashboard';
import { CHART_INK, SEQUENTIAL_PRIMARY } from '../constants/palette';

const DIMENSION_LABEL_KEYS: Record<DashboardDimension, string> = {
  department: 'dashboard.byDepartment',
  country: 'dashboard.byCountry',
  jobLevel: 'dashboard.byJobLevel',
};

// Magnitude comparison → ONE sequential hue (dataviz rules), never a color
// per bar. Tooltip carries average, median and headcount.
export const SalaryByDimensionChart = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [dimension, setDimension] = useState<DashboardDimension>('jobLevel');
  const rows = useAppSelector(getDimensionStats(dimension));
  const range = useAppSelector(getDashboardRange);

  // refetch on dimension OR range change (a range change clears the cache)
  useEffect(() => {
    void dispatch(fetchDimension(dimension));
  }, [dispatch, dimension, range]);

  // params take recharts' wide ValueType/NameType — narrow inside
  const tooltipFormatter = (value: unknown): [string, string] => [
    formatCurrency(Number(value)),
    t('dashboard.salaryOverview.average'),
  ];

  const labelFormatter = (label: unknown, payload: unknown): string => {
    const stat = (payload as Array<{ payload?: { headcount: number; medianSalaryUsd: number } }>)?.[0]
      ?.payload;
    if (!stat) {
      return String(label);
    }
    const median = `${t('dashboard.salaryOverview.median')}: ${formatCurrency(stat.medianSalaryUsd)}`;
    const headcount = `${t('dashboard.salaryOverview.employees')}: ${formatNumber(stat.headcount)}`;
    return `${label} · ${headcount} · ${median}`;
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t('dashboard.salaryOverview.title')}</CardTitle>
        <Select
          value={dimension}
          onValueChange={(value) => setDimension(value as DashboardDimension)}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DASHBOARD_DIMENSIONS.map((option) => (
              <SelectItem key={option} value={option} className="text-xs">
                {t(DIMENSION_LABEL_KEYS[option])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows ?? []} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_INK.grid} strokeWidth={1} />
              <XAxis
                dataKey="key"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: CHART_INK.muted }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={56}
                tickFormatter={(value: string) =>
                  value.length > 14 ? `${value.slice(0, 13)}…` : value
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 11, fill: CHART_INK.muted }}
                tickFormatter={(value: number) => formatCurrency(value, 'USD', { compact: true })}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={tooltipFormatter}
                labelFormatter={labelFormatter}
              />
              <Bar
                dataKey="averageSalaryUsd"
                fill={SEQUENTIAL_PRIMARY}
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
