import { thunk } from 'redux-thunk';

// Tuple (not Middleware[]) so applyMiddleware keeps thunk's dispatch typing
export const middleware = [thunk] as const;
