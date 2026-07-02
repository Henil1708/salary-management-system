import { useTranslation } from 'react-i18next';
import { DimensionStat } from '@salary/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/utils/format';
import { SEQUENTIAL_PRIMARY, SEQUENTIAL_SOFT } from '../constants/palette';

interface PayrollByCountryProps {
  rows: DimensionStat[];
}

// Payroll per country = average × headcount (exactly the SUM the average was
// computed from). Magnitude job → proportional bars in the single brand hue.
export const PayrollByCountry = ({ rows }: PayrollByCountryProps) => {
  const { t } = useTranslation();

  const withPayroll = rows
    .map((row) => ({ ...row, payrollUsd: row.averageSalaryUsd * row.headcount }))
    .sort((a, b) => b.payrollUsd - a.payrollUsd);
  const max = withPayroll[0]?.payrollUsd ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('dashboard.payrollByCountry.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {withPayroll.map((row) => (
            <div key={row.key} className="grid grid-cols-[7.5rem_1fr_5rem] items-center gap-3">
              <div className="truncate text-sm">{row.key}</div>
              <div className="h-2.5 rounded-full" style={{ backgroundColor: SEQUENTIAL_SOFT }}>
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${Math.max((row.payrollUsd / max) * 100, 2)}%`,
                    backgroundColor: SEQUENTIAL_PRIMARY,
                  }}
                />
              </div>
              <div className="text-right text-sm font-medium tabular-nums">
                {formatCurrency(row.payrollUsd, 'USD', { compact: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
