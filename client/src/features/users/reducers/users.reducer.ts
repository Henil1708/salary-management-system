import { UnknownAction } from 'redux';
import { UserDto } from '@salary/shared';
import {
  CREATE_USER_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  UsersAction,
} from '../actions/users.actionTypes';

export interface UsersState {
  items: UserDto[];
  loading: boolean;
  errorCode: string | null;
}

const initialState: UsersState = { items: [], loading: false, errorCode: null };

export const usersReducer = (
  state: UsersState = initialState,
  incoming: UnknownAction
): UsersState => {
  const action = incoming as UsersAction;
  switch (action.type) {
    case FETCH_USERS_REQUEST:
      return { ...state, loading: true, errorCode: null };
    case FETCH_USERS_SUCCESS:
      return { ...state, items: action.payload, loading: false };
    case CREATE_USER_SUCCESS:
      return { ...state, items: [...state.items, action.payload] };
    case FETCH_USERS_FAILURE:
      return { ...state, loading: false, errorCode: action.payload.errorCode };
    default:
      return state;
  }
};
