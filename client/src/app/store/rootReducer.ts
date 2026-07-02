import { combineReducers } from 'redux';
import { authReducer } from '@/features/auth';
import { dashboardReducer } from '@/features/dashboard';

// Feature reducers register here as each feature lands
// (employees, salary, importExport)
export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
});
