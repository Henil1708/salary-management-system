import {
  CreateEmployeeInput,
  EmployeeListQuery,
  UpdateEmployeeInput,
} from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { EmployeesService } from '../services/employees.service';
import {
  FETCH_LIST_FAILURE,
  FETCH_LIST_REQUEST,
  FETCH_LIST_SUCCESS,
  FETCH_ONE_FAILURE,
  FETCH_ONE_REQUEST,
  FETCH_ONE_SUCCESS,
  SET_QUERY,
  UPSERT_SUCCESS,
} from './employees.actionTypes';

const toErrorCode = (error: unknown): string =>
  error instanceof ApiCodeError ? error.code : 'INTERNAL';

export const fetchEmployees = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  dispatch({ type: FETCH_LIST_REQUEST });
  try {
    const page = await EmployeesService.list(getState().employees.query);
    dispatch({ type: FETCH_LIST_SUCCESS, payload: page });
  } catch (error) {
    dispatch({ type: FETCH_LIST_FAILURE, payload: { errorCode: toErrorCode(error) } });
  }
};

// Patch the query, then refetch. A filter/search/sort change resets to page 1;
// an explicit page change keeps the rest of the query.
export const updateQuery =
  (patch: Partial<EmployeeListQuery>): AppThunk =>
  (dispatch) => {
    const withPageReset = 'page' in patch ? patch : { ...patch, page: 1 };
    dispatch({ type: SET_QUERY, payload: withPageReset });
    void dispatch(fetchEmployees());
  };

export const fetchEmployee =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch({ type: FETCH_ONE_REQUEST });
    try {
      dispatch({ type: FETCH_ONE_SUCCESS, payload: await EmployeesService.get(id) });
    } catch (error) {
      dispatch({ type: FETCH_ONE_FAILURE, payload: { errorCode: toErrorCode(error) } });
    }
  };

// Create/update return the saved employee; the component handles ApiFieldError
// (fail envelope) for inline form errors, so these rethrow rather than swallow.
export const createEmployee =
  (input: CreateEmployeeInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const employee = await EmployeesService.create(input);
    dispatch({ type: UPSERT_SUCCESS, payload: employee });
    void dispatch(fetchEmployees());
  };

export const updateEmployee =
  (id: string, input: UpdateEmployeeInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const employee = await EmployeesService.update(id, input);
    dispatch({ type: UPSERT_SUCCESS, payload: employee });
  };
