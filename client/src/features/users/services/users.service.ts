import { CreateUserInput, UserDto } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

export const UsersService = {
  list: () => apiClient.get<UserDto[]>('/users'),
  create: (input: CreateUserInput) => apiClient.post<UserDto>('/users', input),
};
