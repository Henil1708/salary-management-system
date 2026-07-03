import { useTranslation } from 'react-i18next';
import { RecentChange } from '@salary/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface RecentChangesListProps {
  rows: RecentChange[];
}

const initials = (change: RecentChange): string =>
  `${change.firstName[0] ?? ''}${change.lastName[0] ?? ''}`.toUpperCase();

export const RecentChangesList = ({ rows }: RecentChangesListProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('dashboard.recentChanges.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.map((change) => (
          <div
            key={`${change.employeeId}-${String(change.effectiveDate)}`}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(change)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {change.firstName} {change.lastName}
              </div>
              <div className="truncate text-xs text-muted-foreground">{change.employeeCode}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(change.amount, change.currency)}
                {t('common.perMonth')}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(change.effectiveDate)}
              </div>
            </div>
            <span className="ml-2 hidden shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground sm:inline">
              {change.reason}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
