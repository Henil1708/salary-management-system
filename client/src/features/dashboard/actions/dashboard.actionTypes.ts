import {
  DashboardDimension,
  DashboardSummary,
  DimensionStat,
  PayrollTrendPoint,
  RecentChange,
} from '@salary/shared';
import { DateRange } from '../services/dashboard.service';

export const FETCH_SUMMARY_REQUEST = 'dashboard/FETCH_SUMMARY_REQUEST' as const;
export const FETCH_SUMMARY_SUCCESS = 'dashboard/FETCH_SUMMARY_SUCCESS' as const;
export const FETCH_SUMMARY_FAILURE = 'dashboard/FETCH_SUMMARY_FAILURE' as const;

export const FETCH_DIMENSION_REQUEST = 'dashboard/FETCH_DIMENSION_REQUEST' as const;
export const FETCH_DIMENSION_SUCCESS = 'dashboard/FETCH_DIMENSION_SUCCESS' as const;
export const FETCH_DIMENSION_FAILURE = 'dashboard/FETCH_DIMENSION_FAILURE' as const;

export const FETCH_RECENT_REQUEST = 'dashboard/FETCH_RECENT_REQUEST' as const;
export const FETCH_RECENT_SUCCESS = 'dashboard/FETCH_RECENT_SUCCESS' as const;
export const FETCH_RECENT_FAILURE = 'dashboard/FETCH_RECENT_FAILURE' as const;

export const FETCH_TREND_REQUEST = 'dashboard/FETCH_TREND_REQUEST' as const;
export const FETCH_TREND_SUCCESS = 'dashboard/FETCH_TREND_SUCCESS' as const;
export const FETCH_TREND_FAILURE = 'dashboard/FETCH_TREND_FAILURE' as const;

export const SET_RANGE = 'dashboard/SET_RANGE' as const;

export type DashboardAction =
  | { type: typeof FETCH_SUMMARY_REQUEST }
  | { type: typeof FETCH_SUMMARY_SUCCESS; payload: DashboardSummary }
  | { type: typeof FETCH_SUMMARY_FAILURE; payload: { errorCode: string } }
  | { type: typeof FETCH_DIMENSION_REQUEST; payload: { dimension: DashboardDimension } }
  | {
      type: typeof FETCH_DIMENSION_SUCCESS;
      payload: { dimension: DashboardDimension; rows: DimensionStat[] };
    }
  | { type: typeof FETCH_DIMENSION_FAILURE; payload: { errorCode: string } }
  | { type: typeof FETCH_RECENT_REQUEST }
  | { type: typeof FETCH_RECENT_SUCCESS; payload: RecentChange[] }
  | { type: typeof FETCH_RECENT_FAILURE; payload: { errorCode: string } }
  | { type: typeof FETCH_TREND_REQUEST }
  | { type: typeof FETCH_TREND_SUCCESS; payload: PayrollTrendPoint[] }
  | { type: typeof FETCH_TREND_FAILURE; payload: { errorCode: string } }
  | { type: typeof SET_RANGE; payload: DateRange };
