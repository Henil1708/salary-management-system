import { CreateSalaryRecordInput } from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { SalaryService } from '../services/salary.service';
import {
  ADD_REVISION_SUCCESS,
  CLEAR_HISTORY,
  FETCH_HISTORY_FAILURE,
  FETCH_HISTORY_REQUEST,
  FETCH_HISTORY_SUCCESS,
} from './salary.actionTypes';

export const fetchSalaryHistory =
  (employeeId: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch({ type: FETCH_HISTORY_REQUEST });
    try {
      dispatch({ type: FETCH_HISTORY_SUCCESS, payload: await SalaryService.history(employeeId) });
    } catch (error) {
      dispatch({
        type: FETCH_HISTORY_FAILURE,
        payload: { errorCode: error instanceof ApiCodeError ? error.code : 'INTERNAL' },
      });
    }
  };

// Rethrows so the revision dialog can surface ApiFieldError inline; the
// server flips isCurrent transactionally, so we refetch the whole history.
export const addSalaryRevision =
  (employeeId: string, input: CreateSalaryRecordInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const record = await SalaryService.addRevision(employeeId, input);
    dispatch({ type: ADD_REVISION_SUCCESS, payload: record });
    void dispatch(fetchSalaryHistory(employeeId));
  };

export const clearSalaryHistory = (): AppThunk => (dispatch) => {
  dispatch({ type: CLEAR_HISTORY });
};
