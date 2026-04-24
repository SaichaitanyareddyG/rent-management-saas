/**
 * Redux Store Configuration
 * RTK Query + Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { publicApi } from '../services/publicApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(publicApi.middleware),
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
