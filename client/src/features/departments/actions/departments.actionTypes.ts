import { DepartmentDto } from '@salary/shared';

export const FETCH_DEPARTMENTS_REQUEST = 'departments/FETCH_REQUEST' as const;
export const FETCH_DEPARTMENTS_SUCCESS = 'departments/FETCH_SUCCESS' as const;
export const FETCH_DEPARTMENTS_FAILURE = 'departments/FETCH_FAILURE' as const;

export type DepartmentsAction =
  | { type: typeof FETCH_DEPARTMENTS_REQUEST }
  | { type: typeof FETCH_DEPARTMENTS_SUCCESS; payload: DepartmentDto[] }
  | { type: typeof FETCH_DEPARTMENTS_FAILURE; payload: { errorCode: string } };
