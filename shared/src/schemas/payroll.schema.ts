import { z } from 'zod';
import { Paginated } from '../types/api-response';

// A payroll run is created for a month (YYYY-MM).
export const createPayrollRunSchema = z.object({
  period: z
    .string({ required_error: 'errors.validation.payroll.periodRequired' })
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'errors.validation.payroll.periodInvalid'),
});

export const markPayrollItemSchema = z.object({
  paid: z.boolean(),
});

// Filters for a run's line items — machine params (coerced), so Zod defaults
// are fine. Salary range is in USD since a run mixes currencies.
export const payrollItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  minUsd: z.coerce.number().min(0).optional(),
  maxUsd: z.coerce.number().min(0).optional(),
});

export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;
export type MarkPayrollItemInput = z.infer<typeof markPayrollItemSchema>;
export type PayrollItemsQuery = z.infer<typeof payrollItemsQuerySchema>;

export type PayrollStatus = 'PENDING' | 'PROCESSING' | 'PAID';
export type PayrollItemStatus = 'PENDING' | 'PAID';

export interface PayrollRunSummaryDto {
  id: string;
  period: string;
  status: PayrollStatus;
  itemCount: number;
  paidCount: number;
  totalUsd: number;
  paidUsd: number;
  createdAt: Date | string;
}

export interface PayrollItemDto {
  id: string;
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  amount: number;
  currency: string;
  amountUsd: number;
  status: PayrollItemStatus;
  paidAt: Date | string | null;
}

export interface PayrollRunDetailDto {
  run: PayrollRunSummaryDto;
  items: Paginated<PayrollItemDto>;
}
