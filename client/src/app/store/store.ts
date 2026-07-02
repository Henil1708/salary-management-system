// Classic Redux store (action/reducer pattern per the client blueprint,
// GitHub issue #14) — not Redux Toolkit slices.
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { middleware } from './middleware';
import { rootReducer } from './rootReducer';

export const store = createStore(rootReducer, applyMiddleware(...middleware));
