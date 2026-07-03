import { CreateDepartmentInput, DepartmentDto, UpdateDepartmentInput } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

export const DepartmentsService = {
  list: () => apiClient.get<DepartmentDto[]>('/departments'),
  create: (input: CreateDepartmentInput) => apiClient.post<DepartmentDto>('/departments', input),
  update: (id: string, input: UpdateDepartmentInput) =>
    apiClient.patch<DepartmentDto>(`/departments/${id}`, input),
  remove: (id: string) => apiClient.delete<null>(`/departments/${id}`),
};
