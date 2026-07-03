import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TableSkeleton } from '@/shared/components/feedback/skeletons';
import {
  clearSalaryHistory,
  fetchSalaryHistory,
  getSalaryLoading,
  getSalaryRecords,
} from '@/features/salary';
import { SalaryHistoryTable } from './SalaryHistoryTable';
import { SalaryRevisionDialog } from './SalaryRevisionDialog';

interface SalaryHistoryCardProps {
  employeeId: string;
  defaultCurrency: string;
}

// Owns the salary slice for a profile: loads history on mount, offers the
// revision dialog. Lives inside EmployeeProfilePage (salary has no page of
// its own, per the blueprint).
export const SalaryHistoryCard = ({ employeeId, defaultCurrency }: SalaryHistoryCardProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const records = useAppSelector(getSalaryRecords);
  const loading = useAppSelector(getSalaryLoading);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchSalaryHistory(employeeId));
    return () => {
      dispatch(clearSalaryHistory());
    };
  }, [dispatch, employeeId]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t('salary.history.title')}</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t('salary.revision.title')}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && records.length === 0 ? (
          <TableSkeleton rows={3} columns={3} />
        ) : (
          <SalaryHistoryTable records={records} />
        )}
      </CardContent>
      <SalaryRevisionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employeeId={employeeId}
        defaultCurrency={defaultCurrency}
      />
    </Card>
  );
};
