import { combineReducers } from 'redux';
import { authReducer } from '@/features/auth';

// Feature reducers register here as each feature lands
// (employees, salary, dashboard, importExport)
export const rootReducer = combineReducers({
  auth: authReducer,
});
