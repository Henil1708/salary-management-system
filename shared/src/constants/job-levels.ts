export const JOB_LEVELS = ['Junior', 'Mid', 'Senior', 'Manager', 'Director'] as const;

export type JobLevel = (typeof JOB_LEVELS)[number];

export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
