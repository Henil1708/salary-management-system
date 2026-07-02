import { UnknownAction } from 'redux';
import { DashboardDimension, DashboardSummary, DimensionStat, RecentChange } from '@salary/shared';
import {
  DashboardAction,
  FETCH_DIMENSION_FAILURE,
  FETCH_DIMENSION_SUCCESS,
  FETCH_RECENT_FAILURE,
  FETCH_RECENT_SUCCESS,
  FETCH_SUMMARY_FAILURE,
  FETCH_SUMMARY_REQUEST,
  FETCH_SUMMARY_SUCCESS,
} from '../actions/dashboard.actionTypes';

export interface DashboardState {
  summary: DashboardSummary | null;
  byDimension: Partial<Record<DashboardDimension, DimensionStat[]>>;
  recentChanges: RecentChange[];
  loading: boolean;
  errorCode: string | null;
}

const initialState: DashboardState = {
  summary: null,
  byDimension: {},
  recentChanges: [],
  loading: false,
  errorCode: null,
};

export const dashboardReducer = (
  state: DashboardState = initialState,
  incoming: UnknownAction
): DashboardState => {
  const action = incoming as DashboardAction;
  switch (action.type) {
    case FETCH_SUMMARY_REQUEST:
      return { ...state, loading: true, errorCode: null };
    case FETCH_SUMMARY_SUCCESS:
      return { ...state, summary: action.payload, loading: false };
    case FETCH_DIMENSION_SUCCESS:
      return {
        ...state,
        byDimension: { ...state.byDimension, [action.payload.dimension]: action.payload.rows },
      };
    case FETCH_RECENT_SUCCESS:
      return { ...state, recentChanges: action.payload };
    case FETCH_SUMMARY_FAILURE:
    case FETCH_DIMENSION_FAILURE:
    case FETCH_RECENT_FAILURE:
      return { ...state, loading: false, errorCode: action.payload.errorCode };
    default:
      return state;
  }
};
