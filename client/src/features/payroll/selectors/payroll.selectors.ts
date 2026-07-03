import { RootState } from '@/app/store/types';

export const getPayrollRuns = (state: RootState) => state.payroll.runs;
export const getPayrollRunsLoading = (state: RootState) => state.payroll.runsLoading;
export const getCurrentRun = (state: RootState) => state.payroll.current;
export const getRunDetailLoading = (state: RootState) => state.payroll.detailLoading;
export const getItemsPage = (state: RootState) => state.payroll.itemsPage;
export const getItemFilters = (state: RootState) => state.payroll.itemFilters;
