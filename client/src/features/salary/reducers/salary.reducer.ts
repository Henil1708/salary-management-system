import { UnknownAction } from 'redux';
import { SalaryRecordDto } from '@salary/shared';
import {
  CLEAR_HISTORY,
  FETCH_HISTORY_FAILURE,
  FETCH_HISTORY_REQUEST,
  FETCH_HISTORY_SUCCESS,
  SalaryAction,
} from '../actions/salary.actionTypes';

export interface SalaryState {
  records: SalaryRecordDto[];
  loading: boolean;
  errorCode: string | null;
}

const initialState: SalaryState = {
  records: [],
  loading: false,
  errorCode: null,
};

export const salaryReducer = (
  state: SalaryState = initialState,
  incoming: UnknownAction
): SalaryState => {
  const action = incoming as SalaryAction;
  switch (action.type) {
    case FETCH_HISTORY_REQUEST:
      return { ...state, loading: true, errorCode: null };
    case FETCH_HISTORY_SUCCESS:
      return { ...state, records: action.payload, loading: false };
    case FETCH_HISTORY_FAILURE:
      return { ...state, loading: false, errorCode: action.payload.errorCode };
    case CLEAR_HISTORY:
      return initialState;
    default:
      return state;
  }
};
