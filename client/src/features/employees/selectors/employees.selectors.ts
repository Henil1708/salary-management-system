import { RootState } from '@/app/store/types';

export const getEmployees = (state: RootState) => state.employees.items;
export const getEmployeeQuery = (state: RootState) => state.employees.query;
export const getEmployeeTotal = (state: RootState) => state.employees.total;
export const getEmployeeTotalPages = (state: RootState) => state.employees.totalPages;
export const getCurrentEmployee = (state: RootState) => state.employees.current;
export const getListLoading = (state: RootState) => state.employees.listLoading;
export const getDetailLoading = (state: RootState) => state.employees.detailLoading;
export const getEmployeeErrorCode = (state: RootState) => state.employees.errorCode;
