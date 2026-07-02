export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Customer Support',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
