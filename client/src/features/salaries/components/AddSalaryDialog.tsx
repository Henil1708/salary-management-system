import { useEffect, useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { CreateSalaryRecordInput, CURRENCY_CODES, EmployeeDto, createSalaryRecordSchema } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { TextField } from '@/shared/components/form/text-field';
import { SelectField } from '@/shared/components/form/select-field';
import { ApiFieldError } from '@/shared/services/api-client';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { cn } from '@/shared/utils/cn';
import { addSalary } from '@/features/salaries';
import { SalariesService } from '../services/salaries.service';

interface AddSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSalaryDialog = ({ open, onOpenChange }: AddSalaryDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<EmployeeDto | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<EmployeeDto[]>([]);
  const debouncedSearch = useDebounce(search);

  // reset picker each time the dialog opens
  useEffect(() => {
    if (open) {
      setSelected(null);
      setSearch('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (selected || !open) {
      return;
    }
    let active = true;
    void SalariesService.searchEmployees(debouncedSearch).then((page) => {
      if (active) {
        setResults(page.items);
      }
    });
    return () => {
      active = false;
    };
  }, [debouncedSearch, selected, open]);

  const initialValues = {
    amount: '' as unknown as number,
    currency: (selected?.currentSalary?.currency ?? 'USD') as CreateSalaryRecordInput['currency'],
    effectiveDate: new Date().toISOString().slice(0, 10) as unknown as Date,
    reason: '',
  } as CreateSalaryRecordInput;

  const handleSubmit = async (
    values: CreateSalaryRecordInput,
    helpers: FormikHelpers<CreateSalaryRecordInput>
  ) => {
    if (!selected) {
      return;
    }
    try {
      await dispatch(addSalary(selected.id, values));
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
          <DialogTitle>{t('salaries.addSalary')}</DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-2">
            <Label>{t('salaries.selectEmployee')}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('salaries.searchEmployee')}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {results.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setSelected(employee)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span>
                    <span className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {employee.employeeCode} · {employee.department}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Formik<CreateSalaryRecordInput>
            initialValues={initialValues}
            validate={zodToFormikValidate(createSalaryRecordSchema)}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty, isSubmitting }) => (
              <Form className="space-y-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-left text-sm'
                  )}
                >
                  <span className="font-medium">
                    {selected.firstName} {selected.lastName}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {selected.employeeCode}
                    </span>
                  </span>
                  <Check className="h-4 w-4 text-primary" />
                </button>
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
        )}
      </DialogContent>
    </Dialog>
  );
};
