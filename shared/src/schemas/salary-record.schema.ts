import { z } from 'zod';
import { CURRENCY_CODES } from '../constants/countries';
import { VALIDATION_LIMITS } from '../constants/validation-limits';

// Messages are locale keys, resolved on the client against
// shared/locales/<lang>.json — see the i18n section of docs/TRADEOFFS.md §5.

export const createSalaryRecordSchema = z.object({
  // Coerced number for transport; the server converts to Prisma Decimal —
  // amounts are never stored as floats (docs/TRADEOFFS.md §1). One key covers
  // missing, non-numeric, zero and negative (docs/TRADEOFFS.md §3).
  amount: z.coerce
    .number({ errorMap: () => ({ message: 'errors.validation.common.invalidSalary' }) })
    .positive('errors.validation.common.invalidSalary'),
  currency: z.enum(CURRENCY_CODES, {
    errorMap: () => ({ message: 'errors.validation.common.unknownCurrency' }),
  }),
  effectiveDate: z.coerce.date({
    errorMap: () => ({ message: 'errors.validation.salary.invalidEffectiveDate' }),
  }),
  reason: z
    .string({ required_error: 'errors.validation.salary.reasonRequired' })
    .trim()
    .min(1, 'errors.validation.salary.reasonRequired')
    .max(VALIDATION_LIMITS.reasonMax, 'errors.validation.salary.reasonTooLong'),
});

export type CreateSalaryRecordInput = z.infer<typeof createSalaryRecordSchema>;
