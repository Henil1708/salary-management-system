import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DepartmentDto } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ApiCodeError } from '@/shared/services/api-client';
import { codeToMessage } from '@/shared/utils/errors';
import { removeDepartment } from '@/features/departments';

interface DeleteDepartmentDialogProps {
  department: DepartmentDto | null;
  onOpenChange: (open: boolean) => void;
}

export const DeleteDepartmentDialog = ({
  department,
  onOpenChange,
}: DeleteDepartmentDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasEmployees = (department?.employeeCount ?? 0) > 0;

  const handleDelete = async () => {
    if (!department) {
      return;
    }
    setErrorCode(null);
    setDeleting(true);
    try {
      await dispatch(removeDepartment(department.id));
      toast.success(t('departments.delete.action'));
      onOpenChange(false);
    } catch (error) {
      setErrorCode(error instanceof ApiCodeError ? error.code : 'INTERNAL');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={Boolean(department)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('departments.delete.title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {hasEmployees
            ? t('departments.delete.blocked', { count: department?.employeeCount })
            : t('departments.delete.confirm', { name: department?.name })}
        </p>
        {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('departments.form.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={hasEmployees || deleting}>
            {t('departments.delete.action')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
