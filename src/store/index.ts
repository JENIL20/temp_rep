import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../domains/auth/store/authSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth reducer. Add other reducers you want to persist
  // blacklist: [], // Add reducers you DON'T want to persist
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from redux-persist
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;