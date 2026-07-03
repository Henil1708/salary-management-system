import { combineReducers } from 'redux';
import { authReducer } from '@/features/auth';
import { dashboardReducer } from '@/features/dashboard';
import { employeesReducer } from '@/features/employees';
import { salaryReducer } from '@/features/salary';
import { salariesReducer } from '@/features/salaries';
import { usersReducer } from '@/features/users';

export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  employees: employeesReducer,
  salary: salaryReducer,
  salaries: salariesReducer,
  users: usersReducer,
});
