import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatDate } from '@/shared/utils/format';
import { fetchEmployee, getCurrentEmployee, getDetailLoading } from '@/features/employees';
import { SalaryHistoryCard } from '@/features/salary/components/SalaryHistoryCard';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';

const EmployeeProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const employee = useAppSelector(getCurrentEmployee);
  const loading = useAppSelector(getDetailLoading);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      void dispatch(fetchEmployee(id));
    }
  }, [dispatch, id]);

  if (loading || !employee) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        {loading ? t('common.loading') : t('employee.profile.notFound')}
      </p>
    );
  }

  const field = (labelKey: string, value: string) => (
    <div>
      <div className="text-xs text-muted-foreground">{t(labelKey)}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link
        to="/employees"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('employee.profile.back')}
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">
              {employee.firstName} {employee.lastName}
            </CardTitle>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {employee.employeeCode}
              <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1 h-4 w-4" />
            {t('employee.profile.edit')}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {field('employee.profile.email', employee.email)}
          {field('employee.profile.department', employee.department)}
          {field('employee.profile.country', employee.countryName)}
          {field('employee.profile.jobLevel', employee.jobLevel)}
          {field('employee.profile.hireDate', formatDate(employee.hireDate))}
        </CardContent>
      </Card>

      <SalaryHistoryCard
        employeeId={employee.id}
        defaultCurrency={employee.currentSalary?.currency ?? 'USD'}
      />

      <EmployeeFormDialog open={editOpen} onOpenChange={setEditOpen} employee={employee} />
    </div>
  );
};

export default EmployeeProfilePage;
