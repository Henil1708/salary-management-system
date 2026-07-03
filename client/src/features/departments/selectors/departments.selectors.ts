import { RootState } from '@/app/store/types';

export const getDepartments = (state: RootState) => state.departments.items;
export const getDepartmentNames = (state: RootState) =>
  state.departments.items.map((d) => d.name);
export const getDepartmentsLoading = (state: RootState) => state.departments.loading;
