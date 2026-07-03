import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
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
import {
  clearRun,
  fetchRun,
  getCurrentRun,
  getItemFilters,
  getRunDetailLoading,
  markItemPaid,
  payRunInFull,
  setItemsPage,
} from '@/features/payroll';
import { PayrollItemFilters } from '../components/PayrollItemFilters';
import { PayrollStatusBadge } from '../components/PayrollStatusBadge';

const monthLabel = (period: string): string => {
  const [year, month] = period.split('-');
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
};

const PayrollRunPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const detail = useAppSelector(getCurrentRun);
  const loading = useAppSelector(getRunDetailLoading);
  const filters = useAppSelector(getItemFilters);
  const hasFilters = Boolean(
    filters.search || filters.department || filters.minUsd !== undefined || filters.maxUsd !== undefined
  );

  useEffect(() => {
    if (id) {
      void dispatch(fetchRun(id));
    }
    return () => {
      dispatch(clearRun());
    };
  }, [dispatch, id]);

  if (loading && !detail) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={10} columns={4} />
      </div>
    );
  }
  if (!detail || !id) {
    return null;
  }

  const { run, items } = detail;
  const allPaid = run.status === 'PAID';

  const toggle = async (itemId: string, paid: boolean) => {
    await dispatch(markItemPaid(id, itemId, paid));
  };

  const handlePayAll = async () => {
    await dispatch(payRunInFull(id));
    toast.success(hasFilters ? t('payroll.run.payFiltered') : t('payroll.run.payAll'));
  };

  return (
    <div className="space-y-6">
      <Link
        to="/payroll"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('payroll.run.back')}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            {t('payroll.run.title', { period: monthLabel(run.period) })}
            <PayrollStatusBadge status={run.status} />
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('payroll.run.summary', {
              paid: formatNumber(run.paidCount),
              total: formatNumber(run.itemCount),
            })}{' '}
            · {formatCurrency(run.paidUsd, 'USD', { compact: true })} /{' '}
            {formatCurrency(run.totalUsd, 'USD', { compact: true })}
          </p>
        </div>
        {!allPaid && (
          <Button onClick={handlePayAll}>
            {hasFilters ? t('payroll.run.payFiltered') : t('payroll.run.payAll')}
          </Button>
        )}
      </div>

      <PayrollItemFilters runId={id} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{run.period}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('payroll.run.itemEmployee')}</TableHead>
                <TableHead>{t('departments.columns.name')}</TableHead>
                <TableHead className="text-right">{t('payroll.run.itemAmount')}</TableHead>
                <TableHead className="text-right">{t('payroll.run.itemStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-medium">
                      {item.firstName} {item.lastName}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">{item.employeeCode}</span>
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(item.amount, item.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={item.status === 'PAID' ? 'ghost' : 'outline'}
                      size="sm"
                      className={
                        item.status === 'PAID' ? 'text-emerald-600 hover:text-emerald-700' : ''
                      }
                      onClick={() => toggle(item.id, item.status !== 'PAID')}
                    >
                      {item.status === 'PAID' ? (
                        <>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {t('payroll.status.PAID')}
                        </>
                      ) : (
                        <>
                          <Circle className="mr-1 h-4 w-4" />
                          {t('payroll.run.markPaid')}
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {items.total > items.pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('employee.directory.pagination.range', {
              from: formatNumber((items.page - 1) * items.pageSize + 1),
              to: formatNumber(Math.min(items.page * items.pageSize, items.total)),
              total: formatNumber(items.total),
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={items.page <= 1}
              onClick={() => dispatch(setItemsPage(id, items.page - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('employee.directory.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={items.page >= items.totalPages}
              onClick={() => dispatch(setItemsPage(id, items.page + 1))}
            >
              {t('employee.directory.pagination.next')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollRunPage;
