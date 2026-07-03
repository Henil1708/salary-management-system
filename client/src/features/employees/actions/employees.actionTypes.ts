import { EmployeeDto, EmployeeListQuery, Paginated } from '@salary/shared';

export const SET_QUERY = 'employees/SET_QUERY' as const;

export const FETCH_LIST_REQUEST = 'employees/FETCH_LIST_REQUEST' as const;
export const FETCH_LIST_SUCCESS = 'employees/FETCH_LIST_SUCCESS' as const;
export const FETCH_LIST_FAILURE = 'employees/FETCH_LIST_FAILURE' as const;

export const FETCH_ONE_REQUEST = 'employees/FETCH_ONE_REQUEST' as const;
export const FETCH_ONE_SUCCESS = 'employees/FETCH_ONE_SUCCESS' as const;
export const FETCH_ONE_FAILURE = 'employees/FETCH_ONE_FAILURE' as const;

export const UPSERT_SUCCESS = 'employees/UPSERT_SUCCESS' as const;

export type EmployeesAction =
  | { type: typeof SET_QUERY; payload: Partial<EmployeeListQuery> }
  | { type: typeof FETCH_LIST_REQUEST }
  | { type: typeof FETCH_LIST_SUCCESS; payload: Paginated<EmployeeDto> }
  | { type: typeof FETCH_LIST_FAILURE; payload: { errorCode: string } }
  | { type: typeof FETCH_ONE_REQUEST }
  | { type: typeof FETCH_ONE_SUCCESS; payload: EmployeeDto }
  | { type: typeof FETCH_ONE_FAILURE; payload: { errorCode: string } }
  | { type: typeof UPSERT_SUCCESS; payload: EmployeeDto };
