import { combineReducers } from 'redux';
import { authReducer } from '@/features/auth';
import { dashboardReducer } from '@/features/dashboard';
import { employeesReducer } from '@/features/employees';
import { salaryReducer } from '@/features/salary';

// Feature reducers register here as each feature lands (importExport next)
export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  employees: employeesReducer,
  salary: salaryReducer,
});
