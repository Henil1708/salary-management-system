import { DashboardDimension } from '@salary/shared';
import { RootState } from '@/app/store/types';

export const getSummary = (state: RootState) => state.dashboard.summary;
export const getDimensionStats = (dimension: DashboardDimension) => (state: RootState) =>
  state.dashboard.byDimension[dimension];
export const getPayrollTrend = (state: RootState) => state.dashboard.payrollTrend;
export const getDashboardRange = (state: RootState) => state.dashboard.range;
export const getRecentChanges = (state: RootState) => state.dashboard.recentChanges;
export const getDashboardLoading = (state: RootState) => state.dashboard.loading;
export const getDashboardErrorCode = (state: RootState) => state.dashboard.errorCode;
