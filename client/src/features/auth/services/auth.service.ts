import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';
import { AuthUser } from '../actions/auth.actionTypes';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse extends Tokens {
  user: AuthUser;
}

export const AuthService = {
  login: (input: LoginInput) => apiClient.post<LoginResponse>('/auth/login', input),
  me: () => apiClient.get<AuthUser>('/auth/me'),
  forgotPassword: (input: ForgotPasswordInput) =>
    apiClient.post<null>('/auth/forgot-password', input),
  resetPassword: (input: ResetPasswordInput) => apiClient.post<null>('/auth/reset-password', input),
  updateProfile: (input: UpdateProfileInput) => apiClient.patch<AuthUser>('/auth/me', input),
  changePassword: (input: ChangePasswordInput) =>
    apiClient.post<Tokens>('/auth/change-password', input),
};
