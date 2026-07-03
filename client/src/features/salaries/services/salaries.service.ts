import { CreateSalaryRecordInput, EmployeeDto, Paginated } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

// Org-wide salary management. "All salaries" is every employee's current
// monthly salary (from the /employees list), paginated. The employee picker
// and the recent feed reuse the same endpoint.
export const SalariesService = {
  list: (page: number, pageSize: number) =>
    apiClient.get<Paginated<EmployeeDto>>(
      `/employees?page=${page}&pageSize=${pageSize}&sortBy=lastName&sortOrder=asc`
    ),
  searchEmployees: (search: string) =>
    apiClient.get<Paginated<EmployeeDto>>(
      `/employees?pageSize=8${search ? `&search=${encodeURIComponent(search)}` : ''}`
    ),
  addRevision: (employeeId: string, input: CreateSalaryRecordInput) =>
    apiClient.post(`/employees/${employeeId}/salary-records`, input),
};
