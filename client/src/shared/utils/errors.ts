import { TFunction } from 'i18next';
import { VALIDATION_LIMITS } from '@salary/shared';

// Validation locale keys interpolate VALIDATION_LIMITS ({{passwordMin}} etc.)
// so displayed copy can never drift from the enforced rule
// (docs/TRADEOFFS.md §5).
export const tError = (t: TFunction, key: string): string => t(key, VALIDATION_LIMITS) as string;

/** Map an ApiCodeError's code to translated copy, falling back to the generic error. */
export const codeToMessage = (t: TFunction, code: string): string =>
  t(`errors.codes.${code}`, { defaultValue: t('common.errors.generic') }) as string;

/** Translate a field→key map (Formik errors from an ApiFieldError). */
export const translateFieldErrors = (
  t: TFunction,
  fields: Record<string, string>
): Record<string, string> =>
  Object.fromEntries(Object.entries(fields).map(([field, key]) => [field, tError(t, key)]));
