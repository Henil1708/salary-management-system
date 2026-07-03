import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CreateSalaryRecordInput, CURRENCY_CODES, createSalaryRecordSchema } from '@salary/shared';
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
import { SelectField } from '@/shared/components/form/select-field';
import { ApiFieldError } from '@/shared/services/api-client';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { addSalaryRevision } from '@/features/salary';

interface SalaryRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  defaultCurrency: string;
}

export const SalaryRevisionDialog = ({
  open,
  onOpenChange,
  employeeId,
  defaultCurrency,
}: SalaryRevisionDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const initialValues = {
    amount: '' as unknown as number,
    currency: defaultCurrency as CreateSalaryRecordInput['currency'],
    effectiveDate: new Date().toISOString().slice(0, 10) as unknown as Date,
    reason: '',
  } as CreateSalaryRecordInput;

  const handleSubmit = async (
    values: CreateSalaryRecordInput,
    helpers: FormikHelpers<CreateSalaryRecordInput>
  ) => {
    try {
      await dispatch(addSalaryRevision(employeeId, values));
      toast.success(t('common.toast.salaryAdded'));
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
          <DialogTitle>{t('salary.revision.title')}</DialogTitle>
        </DialogHeader>
        <Formik<CreateSalaryRecordInput>
          initialValues={initialValues}
          validate={zodToFormikValidate(createSalaryRecordSchema)}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField name="amount" label={t('salary.history.columns.amount')} type="number" />
                <SelectField
                  name="currency"
                  label={t('salary.history.columns.currency')}
                  options={CURRENCY_CODES}
                />
              </div>
              <TextField
                name="effectiveDate"
                label={t('salary.history.columns.effectiveDate')}
                type="date"
              />
              <TextField name="reason" label={t('salary.history.columns.reason')} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('employee.form.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || !dirty || !isValid}>
                  {t('salary.revision.submit')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
