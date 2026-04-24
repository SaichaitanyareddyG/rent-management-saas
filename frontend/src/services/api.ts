/**
 * Base API Configuration using RTK Query
 * Handles authentication, base URL, and global error handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Base URL from environment or localhost
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Custom base query with auth token
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);

  // Handle 401 Unauthorized - redirect to login
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return result;
};

// Create base API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Dashboard', 'Property', 'Room', 'Tenant', 'Payment', 'Owner'],
  endpoints: () => ({}),
});
