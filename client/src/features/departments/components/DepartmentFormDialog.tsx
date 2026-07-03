import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  CreateDepartmentInput,
  DepartmentDto,
  createDepartmentSchema,
} from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { TextField } from '@/shared/components/form/text-field';
import { ApiFieldError } from '@/shared/services/api-client';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { createDepartment, updateDepartment } from '@/features/departments';

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → rename; absent → create */
  department?: DepartmentDto;
}

export const DepartmentFormDialog = ({
  open,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(department);

  const handleSubmit = async (
    values: CreateDepartmentInput,
    helpers: FormikHelpers<CreateDepartmentInput>
  ) => {
    try {
      if (isEdit && department) {
        await dispatch(updateDepartment(department.id, values));
      } else {
        await dispatch(createDepartment(values));
      }
      toast.success(isEdit ? t('departments.form.editTitle') : t('departments.form.createTitle'));
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiFieldError) {
        helpers.setErrors(error.fields as Record<string, string>);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('departments.form.editTitle') : t('departments.form.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Formik<CreateDepartmentInput>
          initialValues={{ name: department?.name ?? '' }}
          validate={zodToFormikValidate(createDepartmentSchema)}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="space-y-4">
              <TextField name="name" label={t('departments.form.name')} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('departments.form.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || !dirty || !isValid}>
                  {t('departments.form.save')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
