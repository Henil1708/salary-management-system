import { UserDto } from '@salary/shared';

export const FETCH_USERS_REQUEST = 'users/FETCH_USERS_REQUEST' as const;
export const FETCH_USERS_SUCCESS = 'users/FETCH_USERS_SUCCESS' as const;
export const FETCH_USERS_FAILURE = 'users/FETCH_USERS_FAILURE' as const;

export const CREATE_USER_SUCCESS = 'users/CREATE_USER_SUCCESS' as const;

export type UsersAction =
  | { type: typeof FETCH_USERS_REQUEST }
  | { type: typeof FETCH_USERS_SUCCESS; payload: UserDto[] }
  | { type: typeof FETCH_USERS_FAILURE; payload: { errorCode: string } }
  | { type: typeof CREATE_USER_SUCCESS; payload: UserDto };
