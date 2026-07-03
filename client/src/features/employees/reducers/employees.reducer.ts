import { UnknownAction } from 'redux';
import { EmployeeDto, EmployeeListQuery, employeeListQuerySchema } from '@salary/shared';
import {
  EmployeesAction,
  FETCH_LIST_FAILURE,
  FETCH_LIST_REQUEST,
  FETCH_LIST_SUCCESS,
  FETCH_ONE_FAILURE,
  FETCH_ONE_REQUEST,
  FETCH_ONE_SUCCESS,
  SET_QUERY,
  UPSERT_SUCCESS,
} from '../actions/employees.actionTypes';

export interface EmployeesState {
  items: EmployeeDto[];
  total: number;
  totalPages: number;
  query: EmployeeListQuery;
  current: EmployeeDto | null;
  listLoading: boolean;
  detailLoading: boolean;
  errorCode: string | null;
}

const initialState: EmployeesState = {
  items: [],
  total: 0,
  totalPages: 0,
  // schema defaults are the single source for the initial query shape
  query: employeeListQuerySchema.parse({}),
  current: null,
  listLoading: false,
  detailLoading: false,
  errorCode: null,
};

export const employeesReducer = (
  state: EmployeesState = initialState,
  incoming: UnknownAction
): EmployeesState => {
  const action = incoming as EmployeesAction;
  switch (action.type) {
    case SET_QUERY:
      return { ...state, query: { ...state.query, ...action.payload } };
    case FETCH_LIST_REQUEST:
      return { ...state, listLoading: true, errorCode: null };
    case FETCH_LIST_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        listLoading: false,
      };
    case FETCH_ONE_REQUEST:
      return { ...state, detailLoading: true, current: null, errorCode: null };
    case FETCH_ONE_SUCCESS:
      return { ...state, current: action.payload, detailLoading: false };
    case UPSERT_SUCCESS:
      // keep the open profile in sync after an edit
      return state.current?.id === action.payload.id
        ? { ...state, current: action.payload }
        : state;
    case FETCH_LIST_FAILURE:
    case FETCH_ONE_FAILURE:
      return { ...state, listLoading: false, detailLoading: false, errorCode: action.payload.errorCode };
    default:
      return state;
  }
};
