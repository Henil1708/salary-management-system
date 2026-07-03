import { UnknownAction } from 'redux';
import { DepartmentDto } from '@salary/shared';
import {
  DepartmentsAction,
  FETCH_DEPARTMENTS_FAILURE,
  FETCH_DEPARTMENTS_REQUEST,
  FETCH_DEPARTMENTS_SUCCESS,
} from '../actions/departments.actionTypes';

export interface DepartmentsState {
  items: DepartmentDto[];
  loading: boolean;
  errorCode: string | null;
}

const initialState: DepartmentsState = { items: [], loading: false, errorCode: null };

export const departmentsReducer = (
  state: DepartmentsState = initialState,
  incoming: UnknownAction
): DepartmentsState => {
  const action = incoming as DepartmentsAction;
  switch (action.type) {
    case FETCH_DEPARTMENTS_REQUEST:
      return { ...state, loading: true, errorCode: null };
    case FETCH_DEPARTMENTS_SUCCESS:
      return { ...state, items: action.payload, loading: false };
    case FETCH_DEPARTMENTS_FAILURE:
      return { ...state, loading: false, errorCode: action.payload.errorCode };
    default:
      return state;
  }
};
