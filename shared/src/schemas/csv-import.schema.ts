import { z } from 'zod';
import { COUNTRY_CODES, CURRENCY_CODES } from '../constants/countries';
import { DEPARTMENTS } from '../constants/departments';
import { EMPLOYEE_STATUSES, JOB_LEVELS } from '../constants/job-levels';
import { VALIDATION_LIMITS } from '../constants/validation-limits';

// CSV cells are always strings and may be empty — normalize '' to undefined
// so required_error/default handling works the same as for missing cells.
const emptyToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const CSV_IMPORT_HEADERS = [
  'employeeCode',
  'firstName',
  'lastName',
  'email',
  'department',
  'countryCode',
  'jobLevel',
  'status',
  'hireDate',
  'salaryAmount',
  'salaryCurrency',
] as const;

// Validates one CSV row independently (docs/TRADEOFFS.md §3). A row bundles
// employee fields plus its salary, so this is deliberately distinct from
// createEmployeeSchema — but it reuses the same locale keys wherever the
// meaning is identical, so translations exist once. Unknown reference values
// are rejected, never silently defaulted — a wrong currency corrupts payroll
// totals. Rejected-row reasons are locale keys too; the import endpoint
// translates them server-side (per the request's lang) when writing the
// downloadable report, since that file is read outside the client app.
export const csvRowSchema = z.object({
  employeeCode: z.preprocess(
    emptyToUndefined,
    z
      .string({ required_error: 'errors.validation.employee.codeRequired' })
      .trim()
      .max(VALIDATION_LIMITS.employeeCodeMax, 'errors.validation.employee.codeTooLong')
  ),
  firstName: z.preprocess(
    emptyToUndefined,
    z
      .string({ required_error: 'errors.validation.employee.firstNameRequired' })
      .trim()
      .max(VALIDATION_LIMITS.nameMax, 'errors.validation.employee.firstNameTooLong')
  ),
  lastName: z.preprocess(
    emptyToUndefined,
    z
      .string({ required_error: 'errors.validation.employee.lastNameRequired' })
      .trim()
      .max(VALIDATION_LIMITS.nameMax, 'errors.validation.employee.lastNameTooLong')
  ),
  email: z.preprocess(
    emptyToUndefined,
    z
      .string({ required_error: 'errors.validation.common.emailRequired' })
      .trim()
      .email('errors.validation.common.invalidEmail')
  ),
  department: z.preprocess(
    emptyToUndefined,
    z.enum(DEPARTMENTS, {
      errorMap: () => ({ message: 'errors.validation.common.unknownDepartment' }),
    })
  ),
  countryCode: z.preprocess(
    emptyToUndefined,
    z.enum(COUNTRY_CODES, {
      errorMap: () => ({ message: 'errors.validation.common.unknownCountry' }),
    })
  ),
  jobLevel: z.preprocess(
    emptyToUndefined,
    z.enum(JOB_LEVELS, {
      errorMap: () => ({ message: 'errors.validation.common.unknownJobLevel' }),
    })
  ),
  status: z.preprocess(
    emptyToUndefined,
    z
      .enum(EMPLOYEE_STATUSES, {
        errorMap: () => ({ message: 'errors.validation.common.unknownStatus' }),
      })
      .default('ACTIVE')
  ),
  hireDate: z.preprocess(
    emptyToUndefined,
    z.coerce.date({
      errorMap: () => ({ message: 'errors.validation.common.invalidHireDate' }),
    })
  ),
  salaryAmount: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ errorMap: () => ({ message: 'errors.validation.common.invalidSalary' }) })
      .positive('errors.validation.common.invalidSalary')
  ),
  salaryCurrency: z.preprocess(
    emptyToUndefined,
    z.enum(CURRENCY_CODES, {
      errorMap: () => ({ message: 'errors.validation.common.unknownCurrency' }),
    })
  ),
});

export type CsvRowInput = z.infer<typeof csvRowSchema>;
export type CsvImportHeader = (typeof CSV_IMPORT_HEADERS)[number];
