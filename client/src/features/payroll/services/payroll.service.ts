import { PayrollRunDetailDto, PayrollRunSummaryDto } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

export interface PayrollItemFilters {
  search?: string;
  department?: string;
  minUsd?: number;
  maxUsd?: number;
}

const filterParams = (filters: PayrollItemFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.department) params.set('department', filters.department);
  if (filters.minUsd !== undefined) params.set('minUsd', String(filters.minUsd));
  if (filters.maxUsd !== undefined) params.set('maxUsd', String(filters.maxUsd));
  return params;
};

export const PayrollService = {
  listRuns: () => apiClient.get<PayrollRunSummaryDto[]>('/payroll/runs'),
  createRun: (period: string) =>
    apiClient.post<PayrollRunSummaryDto>('/payroll/runs', { period }),
  getRun: (id: string, page: number, filters: PayrollItemFilters) => {
    const params = filterParams(filters);
    params.set('page', String(page));
    params.set('pageSize', '20');
    return apiClient.get<PayrollRunDetailDto>(`/payroll/runs/${id}?${params.toString()}`);
  },
  markItem: (runId: string, itemId: string, paid: boolean) =>
    apiClient.patch<null>(`/payroll/runs/${runId}/items/${itemId}`, { paid }),
  // pay-all carries the same filters so it pays only the filtered subset
  payAll: (runId: string, filters: PayrollItemFilters) =>
    apiClient.post<null>(`/payroll/runs/${runId}/pay-all?${filterParams(filters).toString()}`),
};
