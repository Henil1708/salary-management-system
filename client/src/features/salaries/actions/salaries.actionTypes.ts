import { EmployeeDto, Paginated } from '@salary/shared';

export const FETCH_SALARIES_REQUEST = 'salaries/FETCH_SALARIES_REQUEST' as const;
export const FETCH_SALARIES_SUCCESS = 'salaries/FETCH_SALARIES_SUCCESS' as const;
export const FETCH_SALARIES_FAILURE = 'salaries/FETCH_SALARIES_FAILURE' as const;

export const SET_PAGE = 'salaries/SET_PAGE' as const;

export type SalariesAction =
  | { type: typeof FETCH_SALARIES_REQUEST }
  | { type: typeof FETCH_SALARIES_SUCCESS; payload: Paginated<EmployeeDto> }
  | { type: typeof FETCH_SALARIES_FAILURE; payload: { errorCode: string } }
  | { type: typeof SET_PAGE; payload: number };
