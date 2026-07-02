// Classic Redux action-type constants: <feature>/<VERB>_<PHASE>
export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST' as const;
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS' as const;
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE' as const;

export const SESSION_RESTORE_REQUEST = 'auth/SESSION_RESTORE_REQUEST' as const;
export const SESSION_RESTORE_SUCCESS = 'auth/SESSION_RESTORE_SUCCESS' as const;
export const SESSION_RESTORE_FAILURE = 'auth/SESSION_RESTORE_FAILURE' as const;

export const LOGOUT = 'auth/LOGOUT' as const;

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  designation: string;
}

export type AuthAction =
  | { type: typeof LOGIN_REQUEST }
  | { type: typeof LOGIN_SUCCESS; payload: AuthUser }
  | { type: typeof LOGIN_FAILURE; payload: { errorCode: string } }
  | { type: typeof SESSION_RESTORE_REQUEST }
  | { type: typeof SESSION_RESTORE_SUCCESS; payload: AuthUser }
  | { type: typeof SESSION_RESTORE_FAILURE }
  | { type: typeof LOGOUT };
