import { useTranslation } from 'react-i18next';
import { SalaryRecordDto } from '@salary/shared';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface SalaryHistoryTableProps {
  records: SalaryRecordDto[];
}

export const SalaryHistoryTable = ({ records }: SalaryHistoryTableProps) => {
  const { t } = useTranslation();
  const cols = 'salary.history.columns';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t(`${cols}.effectiveDate`)}</TableHead>
          <TableHead className="text-right">{t(`${cols}.amount`)}</TableHead>
          <TableHead>{t(`${cols}.reason`)}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <span className="flex items-center gap-2">
                {formatDate(record.effectiveDate)}
                {record.isCurrent && <Badge>{t('salary.history.current')}</Badge>}
              </span>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCurrency(record.amount, record.currency)}
            </TableCell>
            <TableCell className="text-muted-foreground">{record.reason}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
