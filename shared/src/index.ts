// Barrel for @salary/shared — the single source of truth for schemas, types
// and reference constants consumed by both client and server.

export * from './constants/countries';
export * from './constants/departments';
export * from './constants/job-levels';
export * from './constants/validation-limits';

export * from './types/api-response';
export * from './types/dashboard';
export * from './types/employee';

export * from './schemas/auth.schema';
export * from './schemas/user.schema';
export * from './schemas/department.schema';
export * from './schemas/employee.schema';
export * from './schemas/salary-record.schema';
export * from './schemas/csv-import.schema';
export * from './schemas/dashboard.schema';
export * from './schemas/import.schema';
export * from './schemas/payroll.schema';

// i18n resource — only English in v1; adding a locale later is a new file
// here plus registration on the client, nothing else (docs/TRADEOFFS.md §5)
import enLocale from './locales/en.json';
export { enLocale };
