import { CreateUserInput } from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { UsersService } from '../services/users.service';
import {
  CREATE_USER_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
} from './users.actionTypes';

export const fetchUsers = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch({ type: FETCH_USERS_REQUEST });
  try {
    dispatch({ type: FETCH_USERS_SUCCESS, payload: await UsersService.list() });
  } catch (error) {
    dispatch({
      type: FETCH_USERS_FAILURE,
      payload: { errorCode: error instanceof ApiCodeError ? error.code : 'INTERNAL' },
    });
  }
};

// Rethrows so the dialog surfaces ApiFieldError (duplicate email/username) inline.
export const createHrUser =
  (input: CreateUserInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const user = await UsersService.create(input);
    dispatch({ type: CREATE_USER_SUCCESS, payload: user });
  };
