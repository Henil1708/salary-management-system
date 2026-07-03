import { z } from 'zod';
import { VALIDATION_LIMITS } from '../constants/validation-limits';

// Admin-provisioned HR accounts (PRD: no self-registration) — this is the
// create-user form HR uses to add more HR teammates. Messages are locale keys.
export const createUserSchema = z.object({
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
  password: z
    .string({ required_error: 'errors.validation.auth.passwordRequired' })
    .min(VALIDATION_LIMITS.passwordMin, 'errors.validation.auth.passwordTooShort')
    .max(VALIDATION_LIMITS.passwordMax, 'errors.validation.auth.passwordTooLong')
    .regex(/[A-Z]/, 'errors.validation.auth.passwordNeedsUppercase')
    .regex(/[a-z]/, 'errors.validation.auth.passwordNeedsLowercase')
    .regex(/[0-9]/, 'errors.validation.auth.passwordNeedsNumber'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export interface UserDto {
  id: string;
  email: string;
  username: string;
  designation: string;
  createdAt: Date | string;
}
