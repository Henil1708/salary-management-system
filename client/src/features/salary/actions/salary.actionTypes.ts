import { SalaryRecordDto } from '@salary/shared';

export const FETCH_HISTORY_REQUEST = 'salary/FETCH_HISTORY_REQUEST' as const;
export const FETCH_HISTORY_SUCCESS = 'salary/FETCH_HISTORY_SUCCESS' as const;
export const FETCH_HISTORY_FAILURE = 'salary/FETCH_HISTORY_FAILURE' as const;

export const ADD_REVISION_SUCCESS = 'salary/ADD_REVISION_SUCCESS' as const;

export const CLEAR_HISTORY = 'salary/CLEAR_HISTORY' as const;

export type SalaryAction =
  | { type: typeof FETCH_HISTORY_REQUEST }
  | { type: typeof FETCH_HISTORY_SUCCESS; payload: SalaryRecordDto[] }
  | { type: typeof FETCH_HISTORY_FAILURE; payload: { errorCode: string } }
  | { type: typeof ADD_REVISION_SUCCESS; payload: SalaryRecordDto }
  | { type: typeof CLEAR_HISTORY };
