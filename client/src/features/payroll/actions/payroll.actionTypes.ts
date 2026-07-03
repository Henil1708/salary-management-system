import { PayrollRunDetailDto, PayrollRunSummaryDto } from '@salary/shared';
import { PayrollItemFilters } from '../services/payroll.service';

export const FETCH_RUNS_REQUEST = 'payroll/FETCH_RUNS_REQUEST' as const;
export const FETCH_RUNS_SUCCESS = 'payroll/FETCH_RUNS_SUCCESS' as const;
export const FETCH_RUNS_FAILURE = 'payroll/FETCH_RUNS_FAILURE' as const;

export const FETCH_RUN_REQUEST = 'payroll/FETCH_RUN_REQUEST' as const;
export const FETCH_RUN_SUCCESS = 'payroll/FETCH_RUN_SUCCESS' as const;
export const FETCH_RUN_FAILURE = 'payroll/FETCH_RUN_FAILURE' as const;

export const SET_ITEMS_PAGE = 'payroll/SET_ITEMS_PAGE' as const;
export const SET_ITEM_FILTERS = 'payroll/SET_ITEM_FILTERS' as const;
export const CLEAR_RUN = 'payroll/CLEAR_RUN' as const;

export type PayrollAction =
  | { type: typeof FETCH_RUNS_REQUEST }
  | { type: typeof FETCH_RUNS_SUCCESS; payload: PayrollRunSummaryDto[] }
  | { type: typeof FETCH_RUNS_FAILURE; payload: { errorCode: string } }
  | { type: typeof FETCH_RUN_REQUEST }
  | { type: typeof FETCH_RUN_SUCCESS; payload: PayrollRunDetailDto }
  | { type: typeof FETCH_RUN_FAILURE; payload: { errorCode: string } }
  | { type: typeof SET_ITEMS_PAGE; payload: number }
  | { type: typeof SET_ITEM_FILTERS; payload: PayrollItemFilters }
  | { type: typeof CLEAR_RUN };
