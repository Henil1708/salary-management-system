import { CreateSalaryRecordInput, SalaryRecordDto } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

export const SalaryService = {
  history: (employeeId: string) =>
    apiClient.get<SalaryRecordDto[]>(`/employees/${employeeId}/salary-records`),
  addRevision: (employeeId: string, input: CreateSalaryRecordInput) =>
    apiClient.post<SalaryRecordDto>(`/employees/${employeeId}/salary-records`, input),
};
