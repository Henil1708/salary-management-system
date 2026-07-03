import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PayrollTrendPoint } from '@salary/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/utils/format';
import { CHART_INK, SEQUENTIAL_PRIMARY } from '../constants/palette';

interface PayrollTrendChartProps {
  data: PayrollTrendPoint[];
}

// Trend over time → single-series area in the brand hue (dataviz: one series
// needs no legend, the title names it). Month axis shows Mon 'YY.
export const PayrollTrendChart = ({ data }: PayrollTrendChartProps) => {
  const { t } = useTranslation();

  const monthLabel = (month: string): string => {
    const [year, m] = month.split('-');
    const date = new Date(Number(year), Number(m) - 1, 1);
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date);
  };

  const tooltipFormatter = (value: unknown): [string, string] => [
    formatCurrency(Number(value)),
    t('dashboard.payrollTrend.title'),
  ];

  return (
    // fill the grid cell's height (matched to the taller department card) so
    // the chart grows to fit instead of leaving whitespace below it
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-base">{t('dashboard.payrollTrend.title')}</CardTitle>
        <p className="text-xs text-muted-foreground">{t('dashboard.payrollTrend.subtitle')}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="payrollFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SEQUENTIAL_PRIMARY} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SEQUENTIAL_PRIMARY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={CHART_INK.grid} strokeWidth={1} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: CHART_INK.muted }}
                tickFormatter={monthLabel}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 11, fill: CHART_INK.muted }}
                tickFormatter={(value: number) => formatCurrency(value, 'USD', { compact: true })}
                domain={['dataMin - 2000000', 'dataMax + 2000000']}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={tooltipFormatter}
                labelFormatter={(label: unknown) => monthLabel(String(label))}
              />
              <Area
                type="monotone"
                dataKey="payrollUsd"
                stroke={SEQUENTIAL_PRIMARY}
                strokeWidth={2}
                fill="url(#payrollFill)"
                dot={{ r: 3, fill: SEQUENTIAL_PRIMARY }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
