import { UnknownAction } from 'redux';
import { EmployeeDto } from '@salary/shared';
import {
  FETCH_SALARIES_FAILURE,
  FETCH_SALARIES_REQUEST,
  FETCH_SALARIES_SUCCESS,
  SET_PAGE,
  SalariesAction,
} from '../actions/salaries.actionTypes';

export interface SalariesState {
  items: EmployeeDto[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  loading: boolean;
  errorCode: string | null;
}

const initialState: SalariesState = {
  items: [],
  total: 0,
  totalPages: 0,
  page: 1,
  pageSize: 15,
  loading: false,
  errorCode: null,
};

export const salariesReducer = (
  state: SalariesState = initialState,
  incoming: UnknownAction
): SalariesState => {
  const action = incoming as SalariesAction;
  switch (action.type) {
    case SET_PAGE:
      return { ...state, page: action.payload };
    case FETCH_SALARIES_REQUEST:
      return { ...state, loading: true, errorCode: null };
    case FETCH_SALARIES_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        loading: false,
      };
    case FETCH_SALARIES_FAILURE:
      return { ...state, loading: false, errorCode: action.payload.errorCode };
    default:
      return state;
  }
};
