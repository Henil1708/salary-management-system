import { RootState } from '@/app/store/types';

// Components read auth state through these only — never state.auth.* directly
export const getCurrentUser = (state: RootState) => state.auth.user;
export const getIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated';
export const getAuthStatus = (state: RootState) => state.auth.status;
export const getAuthErrorCode = (state: RootState) => state.auth.errorCode;
