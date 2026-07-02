import { ForgotPasswordInput, LoginInput, ResetPasswordInput } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';
import { AuthUser } from '../actions/auth.actionTypes';

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  login: (input: LoginInput) => apiClient.post<LoginResponse>('/auth/login', input),
  me: () => apiClient.get<AuthUser>('/auth/me'),
  forgotPassword: (input: ForgotPasswordInput) =>
    apiClient.post<null>('/auth/forgot-password', input),
  resetPassword: (input: ResetPasswordInput) => apiClient.post<null>('/auth/reset-password', input),
};
