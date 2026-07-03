import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { TableSkeleton } from '@/shared/components/feedback/skeletons';
import { formatCurrency, formatNumber } from '@/shared/utils/format';
import { fetchRuns, getPayrollRuns, getPayrollRunsLoading } from '@/features/payroll';
import { GenerateRunDialog } from '../components/GenerateRunDialog';
import { PayrollStatusBadge } from '../components/PayrollStatusBadge';

const monthLabel = (period: string): string => {
  const [year, month] = period.split('-');
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
};

const PayrollPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const runs = useAppSelector(getPayrollRuns);
  const loading = useAppSelector(getPayrollRunsLoading);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchRuns());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('payroll.title')}</h1>
          <p className="mt-0.5 text-muted-foreground">{t('payroll.subtitle')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t('payroll.runPayroll')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('payroll.runsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && runs.length === 0 ? (
            <TableSkeleton rows={5} columns={5} />
          ) : runs.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{t('payroll.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payroll.columns.period')}</TableHead>
                  <TableHead className="text-right">{t('payroll.columns.employees')}</TableHead>
                  <TableHead className="text-right">{t('payroll.columns.total')}</TableHead>
                  <TableHead className="text-right">{t('payroll.columns.paid')}</TableHead>
                  <TableHead>{t('payroll.columns.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/payroll/${run.id}`)}
                  >
                    <TableCell className="font-medium">{monthLabel(run.period)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(run.itemCount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(run.totalUsd, 'USD', { compact: true })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatNumber(run.paidCount)} / {formatNumber(run.itemCount)}
                    </TableCell>
                    <TableCell>
                      <PayrollStatusBadge status={run.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <GenerateRunDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default PayrollPage;
