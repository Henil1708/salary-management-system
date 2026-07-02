import { z } from 'zod';
import { VALIDATION_LIMITS } from '../constants/validation-limits';

// Messages are locale keys, resolved on the client against
// shared/locales/<lang>.json — see the i18n section of docs/TRADEOFFS.md §5.

// `identifier` accepts email OR username (docs/TRADEOFFS.md §4)
export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'errors.validation.auth.identifierRequired' })
    .trim()
    .min(1, 'errors.validation.auth.identifierRequired'),
  password: z
    .string({ required_error: 'errors.validation.auth.passwordRequired' })
    .min(1, 'errors.validation.auth.passwordRequired'),
});

export const forgotPasswordSchema = z.object({
  identifier: z
    .string({ required_error: 'errors.validation.auth.identifierRequired' })
    .trim()
    .min(1, 'errors.validation.auth.identifierRequired'),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'errors.validation.auth.tokenRequired' })
    .min(1, 'errors.validation.auth.tokenRequired'),
  newPassword: z
    .string({ required_error: 'errors.validation.auth.passwordRequired' })
    .min(VALIDATION_LIMITS.passwordMin, 'errors.validation.auth.passwordTooShort')
    .max(VALIDATION_LIMITS.passwordMax, 'errors.validation.auth.passwordTooLong')
    .regex(/[A-Z]/, 'errors.validation.auth.passwordNeedsUppercase')
    .regex(/[a-z]/, 'errors.validation.auth.passwordNeedsLowercase')
    .regex(/[0-9]/, 'errors.validation.auth.passwordNeedsNumber'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
