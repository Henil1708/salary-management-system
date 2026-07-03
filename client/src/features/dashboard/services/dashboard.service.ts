import {
  DashboardDimension,
  DashboardSummary,
  DimensionStat,
  PayrollTrendPoint,
  RecentChange,
} from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

// A date range drives the whole dashboard: `end` is the point-in-time all
// metrics are computed "as of"; `start`/`end` bound the recent-changes feed.
// Empty range = as of now, unbounded recent changes.
export interface DateRange {
  start?: string;
  end?: string;
}

const asOfParam = (range: DateRange): string => (range.end ? `&asOf=${range.end}` : '');

export const DashboardService = {
  summary: (range: DateRange) =>
    apiClient.get<DashboardSummary>(`/dashboard/summary?_${asOfParam(range)}`),
  salaryByDimension: (dimension: DashboardDimension, range: DateRange) =>
    apiClient.get<DimensionStat[]>(
      `/dashboard/salary-by-dimension?dimension=${dimension}${asOfParam(range)}`
    ),
  payrollTrend: (range: DateRange) =>
    apiClient.get<PayrollTrendPoint[]>(`/dashboard/payroll-trend?_${asOfParam(range)}`),
  recentChanges: (limit: number, range: DateRange) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (range.start) params.set('start', range.start);
    if (range.end) params.set('end', range.end);
    return apiClient.get<RecentChange[]>(`/dashboard/recent-changes?${params.toString()}`);
  },
};
