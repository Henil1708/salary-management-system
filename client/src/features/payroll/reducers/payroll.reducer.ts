import { UnknownAction } from 'redux';
import { PayrollRunDetailDto, PayrollRunSummaryDto } from '@salary/shared';
import { PayrollItemFilters } from '../services/payroll.service';
import {
  CLEAR_RUN,
  FETCH_RUNS_FAILURE,
  FETCH_RUNS_REQUEST,
  FETCH_RUNS_SUCCESS,
  FETCH_RUN_FAILURE,
  FETCH_RUN_REQUEST,
  FETCH_RUN_SUCCESS,
  PayrollAction,
  SET_ITEMS_PAGE,
  SET_ITEM_FILTERS,
} from '../actions/payroll.actionTypes';

export interface PayrollState {
  runs: PayrollRunSummaryDto[];
  runsLoading: boolean;
  current: PayrollRunDetailDto | null;
  detailLoading: boolean;
  itemsPage: number;
  itemFilters: PayrollItemFilters;
  errorCode: string | null;
}

const initialState: PayrollState = {
  runs: [],
  runsLoading: false,
  current: null,
  detailLoading: false,
  itemsPage: 1,
  itemFilters: {},
  errorCode: null,
};

export const payrollReducer = (
  state: PayrollState = initialState,
  incoming: UnknownAction
): PayrollState => {
  const action = incoming as PayrollAction;
  switch (action.type) {
    case FETCH_RUNS_REQUEST:
      return { ...state, runsLoading: true, errorCode: null };
    case FETCH_RUNS_SUCCESS:
      return { ...state, runs: action.payload, runsLoading: false };
    case FETCH_RUN_REQUEST:
      return { ...state, detailLoading: true, errorCode: null };
    case FETCH_RUN_SUCCESS:
      return { ...state, current: action.payload, detailLoading: false };
    case SET_ITEMS_PAGE:
      return { ...state, itemsPage: action.payload };
    case SET_ITEM_FILTERS:
      // a filter change resets to page 1
      return { ...state, itemFilters: action.payload, itemsPage: 1 };
    case CLEAR_RUN:
      return { ...state, current: null, itemsPage: 1, itemFilters: {} };
    case FETCH_RUNS_FAILURE:
    case FETCH_RUN_FAILURE:
      return { ...state, runsLoading: false, detailLoading: false, errorCode: action.payload.errorCode };
    default:
      return state;
  }
};
