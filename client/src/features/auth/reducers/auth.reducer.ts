import { UnknownAction } from 'redux';
import { tokenStorage } from '@/shared/services/token-storage';
import {
  AuthAction,
  AuthUser,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  PROFILE_UPDATED,
  SESSION_RESTORE_FAILURE,
  SESSION_RESTORE_REQUEST,
  SESSION_RESTORE_SUCCESS,
} from '../actions/auth.actionTypes';

export interface AuthState {
  user: AuthUser | null;
  // 'restoring' while /auth/me runs on boot — guards show a spinner, not a
  // premature login redirect
  status: 'idle' | 'restoring' | 'loading' | 'authenticated' | 'unauthenticated';
  // errors.codes.* key, translated at render time — never English in state
  errorCode: string | null;
}

const initialState: AuthState = {
  user: null,
  status: tokenStorage.hasTokens() ? 'restoring' : 'unauthenticated',
  errorCode: null,
};

// Param is UnknownAction (Redux dispatches its own INIT actions); narrowed to
// our union for the switch — the classic-Redux-with-TS pattern
export const authReducer = (
  state: AuthState = initialState,
  incoming: UnknownAction
): AuthState => {
  const action = incoming as AuthAction;
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, status: 'loading', errorCode: null };
    case LOGIN_SUCCESS:
    case SESSION_RESTORE_SUCCESS:
      return { user: action.payload, status: 'authenticated', errorCode: null };
    case LOGIN_FAILURE:
      return { ...state, status: 'unauthenticated', errorCode: action.payload.errorCode };
    case PROFILE_UPDATED:
      return { ...state, user: action.payload };
    case SESSION_RESTORE_REQUEST:
      return { ...state, status: 'restoring' };
    case SESSION_RESTORE_FAILURE:
    case LOGOUT:
      return { user: null, status: 'unauthenticated', errorCode: null };
    default:
      return state;
  }
};
