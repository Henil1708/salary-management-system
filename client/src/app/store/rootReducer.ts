import { combineReducers } from 'redux';
import { authReducer } from '@/features/auth';
import { dashboardReducer } from '@/features/dashboard';
import { departmentsReducer } from '@/features/departments';
import { employeesReducer } from '@/features/employees';
import { salaryReducer } from '@/features/salary';
import { salariesReducer } from '@/features/salaries';
import { payrollReducer } from '@/features/payroll';
import { usersReducer } from '@/features/users';

export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  departments: departmentsReducer,
  employees: employeesReducer,
  salary: salaryReducer,
  salaries: salariesReducer,
  payroll: payrollReducer,
  users: usersReducer,
});
