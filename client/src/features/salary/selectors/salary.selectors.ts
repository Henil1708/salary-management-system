import { RootState } from '@/app/store/types';

export const getSalaryRecords = (state: RootState) => state.salary.records;
export const getSalaryLoading = (state: RootState) => state.salary.loading;
