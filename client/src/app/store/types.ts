import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { rootReducer } from './rootReducer';

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action>;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, Action>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
