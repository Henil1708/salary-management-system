import { DashboardDimension } from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { DashboardService } from '../services/dashboard.service';
import {
  FETCH_DIMENSION_FAILURE,
  FETCH_DIMENSION_REQUEST,
  FETCH_DIMENSION_SUCCESS,
  FETCH_RECENT_FAILURE,
  FETCH_RECENT_REQUEST,
  FETCH_RECENT_SUCCESS,
  FETCH_SUMMARY_FAILURE,
  FETCH_SUMMARY_REQUEST,
  FETCH_SUMMARY_SUCCESS,
  FETCH_TREND_FAILURE,
  FETCH_TREND_REQUEST,
  FETCH_TREND_SUCCESS,
} from './dashboard.actionTypes';

const toErrorCode = (error: unknown): string =>
  error instanceof ApiCodeError ? error.code : 'INTERNAL';

export const fetchSummary = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch({ type: FETCH_SUMMARY_REQUEST });
  try {
    dispatch({ type: FETCH_SUMMARY_SUCCESS, payload: await DashboardService.summary() });
  } catch (error) {
    dispatch({ type: FETCH_SUMMARY_FAILURE, payload: { errorCode: toErrorCode(error) } });
  }
};

export const fetchDimension =
  (dimension: DashboardDimension): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    // aggregates change rarely — don't refetch a dimension already loaded
    if (getState().dashboard.byDimension[dimension]) {
      return;
    }
    dispatch({ type: FETCH_DIMENSION_REQUEST, payload: { dimension } });
    try {
      dispatch({
        type: FETCH_DIMENSION_SUCCESS,
        payload: { dimension, rows: await DashboardService.salaryByDimension(dimension) },
      });
    } catch (error) {
      dispatch({ type: FETCH_DIMENSION_FAILURE, payload: { errorCode: toErrorCode(error) } });
    }
  };

export const fetchRecentChanges =
  (limit = 6): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch({ type: FETCH_RECENT_REQUEST });
    try {
      dispatch({ type: FETCH_RECENT_SUCCESS, payload: await DashboardService.recentChanges(limit) });
    } catch (error) {
      dispatch({ type: FETCH_RECENT_FAILURE, payload: { errorCode: toErrorCode(error) } });
    }
  };

export const fetchPayrollTrend = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch({ type: FETCH_TREND_REQUEST });
  try {
    dispatch({ type: FETCH_TREND_SUCCESS, payload: await DashboardService.payrollTrend() });
  } catch (error) {
    dispatch({ type: FETCH_TREND_FAILURE, payload: { errorCode: toErrorCode(error) } });
  }
};

/** Everything the dashboard page needs, fired in parallel. */
export const fetchDashboard = (): AppThunk => (dispatch) => {
  void dispatch(fetchSummary());
  void dispatch(fetchPayrollTrend());
  void dispatch(fetchDimension('department'));
  void dispatch(fetchDimension('country'));
  void dispatch(fetchRecentChanges());
};
