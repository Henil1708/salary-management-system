import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DimensionStat } from '@salary/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatNumber } from '@/shared/utils/format';
import { CATEGORICAL } from '../constants/palette';

interface DepartmentDonutProps {
  rows: DimensionStat[];
  totalHeadcount: number;
}

// params take recharts' wide ValueType/NameType — narrow inside
const tooltipFormatter = (value: unknown) => formatNumber(Number(value));

// Identity job → categorical hues in FIXED slot order (dataviz rules); the
// legend table doubles as the table view, so identity is never color-alone.
export const DepartmentDonut = ({ rows, totalHeadcount }: DepartmentDonutProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('dashboard.departmentShare.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 lg:flex-row">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows as unknown as Record<string, unknown>[]}
                dataKey="headcount"
                nameKey="key"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={1.5}
                strokeWidth={0}
              >
                {rows.map((row, index) => (
                  <Cell key={row.key} fill={CATEGORICAL[index % CATEGORICAL.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold">{formatNumber(totalHeadcount)}</div>
            <div className="text-xs text-muted-foreground">
              {t('dashboard.departmentShare.employees')}
            </div>
          </div>
        </div>

        <table className="w-full min-w-0 text-xs">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">{t('dashboard.departmentShare.department')}</th>
              <th className="pb-2 text-right font-medium">
                {t('dashboard.departmentShare.employees')}
              </th>
              <th className="pb-2 text-right font-medium">
                {t('dashboard.departmentShare.percentOfTotal')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key} className="border-t border-border/60">
                <td className="py-1.5 pr-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORICAL[index % CATEGORICAL.length] }}
                    />
                    {row.key}
                  </span>
                </td>
                <td className="py-1.5 text-right tabular-nums">{formatNumber(row.headcount)}</td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {((row.headcount / totalHeadcount) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
