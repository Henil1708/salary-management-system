import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
import { formatCurrency, formatDate, formatNumber } from '@/shared/utils/format';
import {
  fetchSalaries,
  getSalaryList,
  getSalaryListLoading,
  getSalaryPage,
  getSalaryTotal,
  getSalaryTotalPages,
  setSalariesPage,
} from '@/features/salaries';
import { AddSalaryDialog } from '../components/AddSalaryDialog';

const SalariesPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const salaries = useAppSelector(getSalaryList);
  const total = useAppSelector(getSalaryTotal);
  const totalPages = useAppSelector(getSalaryTotalPages);
  const page = useAppSelector(getSalaryPage);
  const loading = useAppSelector(getSalaryListLoading);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchSalaries());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('salaries.title')}</h1>
          <p className="mt-0.5 text-muted-foreground">{t('salaries.subtitle')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t('salaries.addSalary')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('salaries.allTitle')}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {t('salaries.count', { total: formatNumber(total) })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && salaries.length === 0 ? (
            <TableSkeleton rows={10} columns={5} />
          ) : salaries.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{t('salaries.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('salaries.employee')}</TableHead>
                  <TableHead>{t('salaries.department')}</TableHead>
                  <TableHead>{t('salaries.country')}</TableHead>
                  <TableHead className="text-right">
                    {t('employee.directory.columns.currentSalary')}
                  </TableHead>
                  <TableHead>{t('salaries.effectiveSince')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Link
                        to={`/employees/${employee.id}`}
                        className="font-medium hover:underline"
                      >
                        {employee.firstName} {employee.lastName}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {employee.employeeCode}
                      </span>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.countryName}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {employee.currentSalary
                        ? `${formatCurrency(employee.currentSalary.amount, employee.currentSalary.currency)}${t('common.perMonth')}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {employee.currentSalary
                        ? formatDate(employee.currentSalary.effectiveDate)
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('employee.directory.pagination.range', {
              from: formatNumber((page - 1) * 15 + 1),
              to: formatNumber(Math.min(page * 15, total)),
              total: formatNumber(total),
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => dispatch(setSalariesPage(page - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('employee.directory.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => dispatch(setSalariesPage(page + 1))}
            >
              {t('employee.directory.pagination.next')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AddSalaryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default SalariesPage;
