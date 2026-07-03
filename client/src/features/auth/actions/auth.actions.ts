import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { ApiCodeError } from '@/shared/services/api-client';
import { tokenStorage } from '@/shared/services/token-storage';
import { AuthService } from '../services/auth.service';
import {
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  PROFILE_UPDATED,
  SESSION_RESTORE_FAILURE,
  SESSION_RESTORE_REQUEST,
  SESSION_RESTORE_SUCCESS,
} from './auth.actionTypes';

// Classic flow (issue #14): dispatch REQUEST → call the service → dispatch
// SUCCESS or FAILURE. Failures store the error CODE (errors.codes.* key),
// never rendered English — components translate at render time.

export const login =
  (input: LoginInput, remember = true): AppThunk<Promise<boolean>> =>
  async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(input);
      tokenStorage.setTokens(accessToken, refreshToken, remember);
      dispatch({ type: LOGIN_SUCCESS, payload: user });
      return true;
    } catch (error) {
      dispatch({
        type: LOGIN_FAILURE,
        payload: { errorCode: error instanceof ApiCodeError ? error.code : 'INTERNAL' },
      });
      return false;
    }
  };

/**
 * Boot-time restore: tokens in storage don't prove a live session — /auth/me
 * settles it (and a stale access token exercises the silent refresh path).
 */
export const restoreSession = (): AppThunk<Promise<void>> => async (dispatch) => {
  if (!tokenStorage.hasTokens()) {
    dispatch({ type: SESSION_RESTORE_FAILURE });
    return;
  }
  dispatch({ type: SESSION_RESTORE_REQUEST });
  try {
    const user = await AuthService.me();
    dispatch({ type: SESSION_RESTORE_SUCCESS, payload: user });
  } catch {
    tokenStorage.clear();
    dispatch({ type: SESSION_RESTORE_FAILURE });
  }
};

export const logout = (): AppThunk => (dispatch) => {
  tokenStorage.clear();
  dispatch({ type: LOGOUT });
};

// Rethrows so the Settings forms surface ApiFieldError inline.
export const updateProfile =
  (input: UpdateProfileInput): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const user = await AuthService.updateProfile(input);
    dispatch({ type: PROFILE_UPDATED, payload: user });
  };

// Changing the password bumps tokenVersion (killing other sessions); the
// server returns a fresh pair so THIS session survives — persist it, keeping
// the current storage choice (remember-me).
export const changePassword =
  (input: ChangePasswordInput): AppThunk<Promise<void>> =>
  async () => {
    const { accessToken, refreshToken } = await AuthService.changePassword(input);
    tokenStorage.setTokens(accessToken, refreshToken);
  };

// No reducer state — the forms own their submission lifecycle; these exist so
// components still dispatch thunks instead of calling services (rule 8/9)
export const forgotPassword =
  (input: ForgotPasswordInput): AppThunk<Promise<void>> =>
  () =>
    AuthService.forgotPassword(input).then(() => undefined);

export const resetPassword =
  (input: ResetPasswordInput): AppThunk<Promise<void>> =>
  () =>
    AuthService.resetPassword(input).then(() => undefined);
