import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatNumber } from '@/shared/utils/format';
import {
  fetchEmployees,
  getEmployeeTotal,
  getEmployees,
  getListLoading,
} from '@/features/employees';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';
import { EmployeePagination } from '../components/EmployeePagination';
import { EmployeeTable } from '../components/EmployeeTable';

const EmployeeDirectoryPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const total = useAppSelector(getEmployeeTotal);
  const employees = useAppSelector(getEmployees);
  const loading = useAppSelector(getListLoading);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchEmployees());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('employee.directory.title')}</h1>
          <p className="mt-0.5 text-muted-foreground">
            {t('employee.directory.subtitle', { total: formatNumber(total) })}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t('employee.directory.addEmployee')}
        </Button>
      </div>

      <EmployeeFilters />

      <Card>
        <CardContent className="p-0">
          {!loading && employees.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {t('employee.directory.empty')}
            </p>
          ) : (
            <EmployeeTable />
          )}
        </CardContent>
      </Card>

      <EmployeePagination />

      <EmployeeFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};

export default EmployeeDirectoryPage;
