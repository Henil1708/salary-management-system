import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { logout } from '../actions/auth.actions';
import { getCurrentUser, getIsAuthenticated } from '../selectors/auth.selectors';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  return {
    user: useAppSelector(getCurrentUser),
    isAuthenticated: useAppSelector(getIsAuthenticated),
    logout: () => dispatch(logout()),
  };
};
