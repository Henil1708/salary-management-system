import { CreateDepartmentInput, UpdateDepartmentInput } from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { DepartmentsService } from '../services/departments.service';
import {
  FETCH_DEPARTMENTS_FAILURE,
  FETCH_DEPARTMENTS_REQUEST,
  FETCH_DEPARTMENTS_SUCCESS,
} from './departments.actionTypes';

export const fetchDepartments = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch({ type: FETCH_DEPARTMENTS_REQUEST });
  try {
    dispatch({ type: FETCH_DEPARTMENTS_SUCCESS, payload: await DepartmentsService.list() });
  } catch (error) {
    dispatch({
      type: FETCH_DEPARTMENTS_FAILURE,
      payload: { errorCode: error instanceof ApiCodeError ? error.code : 'INTERNAL' },
    });
  }
};

// All three mutations rethrow so dialogs can surface ApiFieldError / show a
// toast; each refetches the list so counts stay accurate.
export const createDepartment =
  (input: CreateDepartmentInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await DepartmentsService.create(input);
    void dispatch(fetchDepartments());
  };

export const updateDepartment =
  (id: string, input: UpdateDepartmentInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await DepartmentsService.update(id, input);
    void dispatch(fetchDepartments());
  };

export const removeDepartment =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await DepartmentsService.remove(id);
    void dispatch(fetchDepartments());
  };
