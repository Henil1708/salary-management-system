import { RootState } from '@/app/store/types';

export const getSalaryList = (state: RootState) => state.salaries.items;
export const getSalaryTotal = (state: RootState) => state.salaries.total;
export const getSalaryTotalPages = (state: RootState) => state.salaries.totalPages;
export const getSalaryPage = (state: RootState) => state.salaries.page;
export const getSalaryPageSize = (state: RootState) => state.salaries.pageSize;
export const getSalaryListLoading = (state: RootState) => state.salaries.loading;
