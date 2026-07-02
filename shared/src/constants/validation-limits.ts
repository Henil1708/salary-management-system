// Single source for every numeric validation limit: the Zod schemas use these
// for the actual rules, and the client passes this object as i18next
// interpolation values so locale texts ({{passwordMin}} etc.) can never drift
// from the enforced rule.
export const VALIDATION_LIMITS = {
  passwordMin: 8,
  passwordMax: 100,
  employeeCodeMax: 20,
  nameMax: 100,
  reasonMax: 200,
  pageSizeMax: 100,
} as const;
