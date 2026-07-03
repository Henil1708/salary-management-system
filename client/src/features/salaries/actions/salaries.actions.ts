import { CreateSalaryRecordInput } from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { SalariesService } from '../services/salaries.service';
import {
  FETCH_SALARIES_FAILURE,
  FETCH_SALARIES_REQUEST,
  FETCH_SALARIES_SUCCESS,
  SET_PAGE,
} from './salaries.actionTypes';

export const fetchSalaries = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { page, pageSize } = getState().salaries;
  dispatch({ type: FETCH_SALARIES_REQUEST });
  try {
    dispatch({ type: FETCH_SALARIES_SUCCESS, payload: await SalariesService.list(page, pageSize) });
  } catch (error) {
    dispatch({
      type: FETCH_SALARIES_FAILURE,
      payload: { errorCode: error instanceof ApiCodeError ? error.code : 'INTERNAL' },
    });
  }
};

export const setSalariesPage =
  (page: number): AppThunk =>
  (dispatch) => {
    dispatch({ type: SET_PAGE, payload: page });
    void dispatch(fetchSalaries());
  };

// Rethrows so the dialog surfaces ApiFieldError inline; refetches the page so
// the updated current salary shows immediately.
export const addSalary =
  (employeeId: string, input: CreateSalaryRecordInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await SalariesService.addRevision(employeeId, input);
    void dispatch(fetchSalaries());
  };
