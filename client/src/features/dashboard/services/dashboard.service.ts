import { DashboardDimension, DashboardSummary, DimensionStat, RecentChange } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

export const DashboardService = {
  summary: () => apiClient.get<DashboardSummary>('/dashboard/summary'),
  salaryByDimension: (dimension: DashboardDimension) =>
    apiClient.get<DimensionStat[]>(`/dashboard/salary-by-dimension?dimension=${dimension}`),
  recentChanges: (limit: number) =>
    apiClient.get<RecentChange[]>(`/dashboard/recent-changes?limit=${limit}`),
};
