import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  COUNTRIES,
  CreateEmployeeInput,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  EmployeeDto,
  JOB_LEVELS,
  createEmployeeSchema,
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
import { SelectField } from '@/shared/components/form/select-field';
import { ApiFieldError } from '@/shared/services/api-client';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { createEmployee, updateEmployee } from '@/features/employees';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit mode; absent → create mode */
  employee?: EmployeeDto;
}

const COUNTRY_CODES = COUNTRIES.map((c) => c.code);

const toInitialValues = (employee?: EmployeeDto): CreateEmployeeInput =>
  ({
    employeeCode: employee?.employeeCode ?? '',
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    department: (employee?.department ?? '') as CreateEmployeeInput['department'],
    countryCode: (employee?.countryCode ?? '') as CreateEmployeeInput['countryCode'],
    jobLevel: (employee?.jobLevel ?? '') as CreateEmployeeInput['jobLevel'],
    status: (employee?.status ?? 'ACTIVE') as CreateEmployeeInput['status'],
    hireDate: (employee?.hireDate
      ? String(employee.hireDate).slice(0, 10)
      : '') as unknown as CreateEmployeeInput['hireDate'],
  }) as CreateEmployeeInput;

export const EmployeeFormDialog = ({ open, onOpenChange, employee }: EmployeeFormDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(employee);

  const handleSubmit = async (
    values: CreateEmployeeInput,
    helpers: FormikHelpers<CreateEmployeeInput>
  ) => {
    try {
      if (isEdit && employee) {
        await dispatch(updateEmployee(employee.id, values));
      } else {
        await dispatch(createEmployee(values));
      }
      onOpenChange(false);
    } catch (error) {
      // server fail envelope → field-level errors (locale keys, translated by the fields)
      if (error instanceof ApiFieldError) {
        helpers.setErrors(error.fields);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('employee.profile.editTitle') : t('employee.profile.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Formik<CreateEmployeeInput>
          initialValues={toInitialValues(employee)}
          validate={zodToFormikValidate(createEmployeeSchema)}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField name="employeeCode" label={t('employee.form.employeeCode')} />
                <TextField name="email" label={t('employee.form.email')} type="email" />
                <TextField name="firstName" label={t('employee.form.firstName')} />
                <TextField name="lastName" label={t('employee.form.lastName')} />
                <SelectField
                  name="department"
                  label={t('employee.form.department')}
                  options={DEPARTMENTS}
                />
                <SelectField name="countryCode" label={t('employee.form.country')} options={COUNTRY_CODES} />
                <SelectField name="jobLevel" label={t('employee.form.jobLevel')} options={JOB_LEVELS} />
                <SelectField name="status" label={t('employee.form.status')} options={EMPLOYEE_STATUSES} />
                <TextField name="hireDate" label={t('employee.form.hireDate')} type="date" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('employee.form.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || (!isEdit && (!dirty || !isValid))}>
                  {t('employee.form.save')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
