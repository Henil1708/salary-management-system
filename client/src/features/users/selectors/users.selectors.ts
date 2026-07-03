import { RootState } from '@/app/store/types';

export const getHrUsers = (state: RootState) => state.users.items;
export const getHrUsersLoading = (state: RootState) => state.users.loading;
