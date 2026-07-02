import { z } from 'zod';
import { COUNTRY_CODES } from '../constants/countries';
import { DEPARTMENTS } from '../constants/departments';
import { EMPLOYEE_STATUSES, JOB_LEVELS } from '../constants/job-levels';
import { VALIDATION_LIMITS } from '../constants/validation-limits';

// Messages are locale keys, resolved on the client against
// shared/locales/<lang>.json — see the i18n section of docs/TRADEOFFS.md §5.

export const createEmployeeSchema = z.object({
  employeeCode: z
    .string({ required_error: 'errors.validation.employee.codeRequired' })
    .trim()
    .min(1, 'errors.validation.employee.codeRequired')
    .max(VALIDATION_LIMITS.employeeCodeMax, 'errors.validation.employee.codeTooLong'),
  firstName: z
    .string({ required_error: 'errors.validation.employee.firstNameRequired' })
    .trim()
    .min(1, 'errors.validation.employee.firstNameRequired')
    .max(VALIDATION_LIMITS.nameMax, 'errors.validation.employee.firstNameTooLong'),
  lastName: z
    .string({ required_error: 'errors.validation.employee.lastNameRequired' })
    .trim()
    .min(1, 'errors.validation.employee.lastNameRequired')
    .max(VALIDATION_LIMITS.nameMax, 'errors.validation.employee.lastNameTooLong'),
  email: z
    .string({ required_error: 'errors.validation.common.emailRequired' })
    .trim()
    .email('errors.validation.common.invalidEmail'),
  department: z.enum(DEPARTMENTS, {
    errorMap: () => ({ message: 'errors.validation.common.unknownDepartment' }),
  }),
  countryCode: z.enum(COUNTRY_CODES, {
    errorMap: () => ({ message: 'errors.validation.common.unknownCountry' }),
  }),
  jobLevel: z.enum(JOB_LEVELS, {
    errorMap: () => ({ message: 'errors.validation.common.unknownJobLevel' }),
  }),
  status: z
    .enum(EMPLOYEE_STATUSES, {
      errorMap: () => ({ message: 'errors.validation.common.unknownStatus' }),
    })
    .default('ACTIVE'),
  hireDate: z.coerce.date({
    errorMap: () => ({ message: 'errors.validation.common.invalidHireDate' }),
  }),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const EMPLOYEE_SORTABLE_COLUMNS = [
  'firstName',
  'lastName',
  'employeeCode',
  'email',
  'hireDate',
  'createdAt',
] as const;

// Contract for the server-side paginated/filtered/sorted list — machine
// params rather than user-typed form fields, so Zod's default messages are
// acceptable here; the server's validate middleware maps any non-key message
// to errors.validation.common.invalid before it reaches the envelope.
export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(VALIDATION_LIMITS.pageSizeMax).default(20),
  search: z.string().trim().min(1).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  countryCode: z.enum(COUNTRY_CODES).optional(),
  jobLevel: z.enum(JOB_LEVELS).optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  sortBy: z.enum(EMPLOYEE_SORTABLE_COLUMNS).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const employeeIdParamSchema = z.object({
  id: z.string().uuid('errors.validation.common.invalid'),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
export type EmployeeSortableColumn = (typeof EMPLOYEE_SORTABLE_COLUMNS)[number];
