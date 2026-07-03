import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DepartmentDto } from '@salary/shared';
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
import { formatNumber } from '@/shared/utils/format';
import {
  fetchDepartments,
  getDepartments,
  getDepartmentsLoading,
} from '@/features/departments';
import { DeleteDepartmentDialog } from '../components/DeleteDepartmentDialog';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';

const DepartmentsPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const departments = useAppSelector(getDepartments);
  const loading = useAppSelector(getDepartmentsLoading);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentDto | undefined>(undefined);
  const [deleting, setDeleting] = useState<DepartmentDto | null>(null);

  useEffect(() => {
    void dispatch(fetchDepartments());
  }, [dispatch]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (department: DepartmentDto) => {
    setEditing(department);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('departments.title')}</h1>
          <p className="mt-0.5 text-muted-foreground">{t('departments.subtitle')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          {t('departments.addDepartment')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('departments.title')}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {t('departments.count', { total: formatNumber(departments.length) })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && departments.length === 0 ? (
            <TableSkeleton rows={6} columns={3} />
          ) : departments.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {t('departments.empty')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('departments.columns.name')}</TableHead>
                  <TableHead className="text-right">{t('departments.columns.employees')}</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(department.employeeCount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(department)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleting(department)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DepartmentFormDialog open={formOpen} onOpenChange={setFormOpen} department={editing} />
      <DeleteDepartmentDialog
        department={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
};

export default DepartmentsPage;
