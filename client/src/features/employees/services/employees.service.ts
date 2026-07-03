import {
  CreateEmployeeInput,
  EmployeeDto,
  EmployeeListQuery,
  Paginated,
  UpdateEmployeeInput,
} from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

// Only defined query params go on the URL — undefined filters are omitted
const toQueryString = (query: EmployeeListQuery): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
};

export const EmployeesService = {
  list: (query: EmployeeListQuery) =>
    apiClient.get<Paginated<EmployeeDto>>(`/employees?${toQueryString(query)}`),
  get: (id: string) => apiClient.get<EmployeeDto>(`/employees/${id}`),
  create: (input: CreateEmployeeInput) => apiClient.post<EmployeeDto>('/employees', input),
  update: (id: string, input: UpdateEmployeeInput) =>
    apiClient.patch<EmployeeDto>(`/employees/${id}`, input),
};
