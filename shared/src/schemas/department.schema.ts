import { z } from 'zod';
import { VALIDATION_LIMITS } from '../constants/validation-limits';

// Departments are DB-backed and managed by HR (create/rename/delete), so the
// name is validated as a bounded string here and its existence is checked
// against the database server-side — no static enum.
export const createDepartmentSchema = z.object({
  name: z
    .string({ required_error: 'errors.validation.department.nameRequired' })
    .trim()
    .min(2, 'errors.validation.department.nameTooShort')
    .max(VALIDATION_LIMITS.nameMax, 'errors.validation.department.nameTooLong'),
});

export const updateDepartmentSchema = createDepartmentSchema;

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export interface DepartmentDto {
  id: string;
  name: string;
  employeeCount: number;
}
