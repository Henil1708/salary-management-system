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

// Self-service: HR editing their own account (Settings)
export const updateProfileSchema = z.object({
  username: z
    .string({ required_error: 'errors.validation.user.usernameRequired' })
    .trim()
    .min(3, 'errors.validation.user.usernameTooShort')
    .max(VALIDATION_LIMITS.nameMax, 'errors.validation.user.usernameTooLong'),
  email: z
    .string({ required_error: 'errors.validation.common.emailRequired' })
    .trim()
    .email('errors.validation.common.invalidEmail'),
  designation: z
    .string({ required_error: 'errors.validation.user.designationRequired' })
    .trim()
    .min(1, 'errors.validation.user.designationRequired')
    .max(VALIDATION_LIMITS.nameMax, 'errors.validation.user.designationTooLong'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'errors.validation.auth.currentPasswordRequired' })
    .min(1, 'errors.validation.auth.currentPasswordRequired'),
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
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
