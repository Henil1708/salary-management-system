import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { PayrollItemFilters, PayrollService } from '../services/payroll.service';
import {
  CLEAR_RUN,
  FETCH_RUNS_FAILURE,
  FETCH_RUNS_REQUEST,
  FETCH_RUNS_SUCCESS,
  FETCH_RUN_FAILURE,
  FETCH_RUN_REQUEST,
  FETCH_RUN_SUCCESS,
  SET_ITEMS_PAGE,
  SET_ITEM_FILTERS,
} from './payroll.actionTypes';

const toErrorCode = (error: unknown): string =>
  error instanceof ApiCodeError ? error.code : 'INTERNAL';

export const fetchRuns = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch({ type: FETCH_RUNS_REQUEST });
  try {
    dispatch({ type: FETCH_RUNS_SUCCESS, payload: await PayrollService.listRuns() });
  } catch (error) {
    dispatch({ type: FETCH_RUNS_FAILURE, payload: { errorCode: toErrorCode(error) } });
  }
};

export const createRun =
  (period: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await PayrollService.createRun(period);
    void dispatch(fetchRuns());
  };

// Reads the current page + filters from state so callers don't thread them.
export const fetchRun =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { itemsPage, itemFilters } = getState().payroll;
    dispatch({ type: FETCH_RUN_REQUEST });
    try {
      dispatch({
        type: FETCH_RUN_SUCCESS,
        payload: await PayrollService.getRun(id, itemsPage, itemFilters),
      });
    } catch (error) {
      dispatch({ type: FETCH_RUN_FAILURE, payload: { errorCode: toErrorCode(error) } });
    }
  };

export const setItemsPage =
  (runId: string, page: number): AppThunk =>
  (dispatch) => {
    dispatch({ type: SET_ITEMS_PAGE, payload: page });
    void dispatch(fetchRun(runId));
  };

// A filter change resets to page 1, then refetches.
export const setItemFilters =
  (runId: string, filters: PayrollItemFilters): AppThunk =>
  (dispatch) => {
    dispatch({ type: SET_ITEM_FILTERS, payload: filters });
    void dispatch(fetchRun(runId));
  };

export const markItemPaid =
  (runId: string, itemId: string, paid: boolean): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await PayrollService.markItem(runId, itemId, paid);
    void dispatch(fetchRun(runId));
  };

// Pays only the currently filtered subset (server applies the same filters).
export const payRunInFull =
  (runId: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    await PayrollService.payAll(runId, getState().payroll.itemFilters);
    void dispatch(fetchRun(runId));
  };

export const clearRun = (): AppThunk => (dispatch) => dispatch({ type: CLEAR_RUN });
