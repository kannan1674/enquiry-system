import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer from './features/authSlice';
import adminReducer from './features/adminSlice';
import wishlistReducer from './features/wishlistSlice';

const appReducer = combineReducers({
  auth: authReducer,
  adminState: adminReducer,
  wishlistState: wishlistReducer,
  wishlistDetailState: wishlistReducer,
});

function rootReducer(state: ReturnType<typeof appReducer> | undefined, action: Parameters<typeof appReducer>[1]) {
  const next = appReducer(state, action);
  return {
    ...next,
    authState: next.auth,
  };
}

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
