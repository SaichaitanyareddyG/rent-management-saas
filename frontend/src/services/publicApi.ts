/**
 * Public API Endpoints
 * No JWT required - for tenant payment flow
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  PublicTenantDetailsResponse,
  PaymentConfirmRequest,
  MessageResponse,
} from '../types/api';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Separate API for public endpoints (no JWT)
export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PublicTenant', 'PublicPayment'],
  endpoints: (builder) => ({
    // Get tenant details for payment page (public access)
    getTenantForPayment: builder.query<PublicTenantDetailsResponse, number>({
      query: (tenantId) => `/public/tenant/${tenantId}`,
      providesTags: (_result, _error, id) => [{ type: 'PublicTenant', id }],
    }),

    // Confirm payment with UTR (public)
    confirmPayment: builder.mutation<MessageResponse, PaymentConfirmRequest>({
      query: (data) => ({
        url: '/public/payments/confirm',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PublicPayment'],
    }),
  }),
});

export const {
  useGetTenantForPaymentQuery,
  useConfirmPaymentMutation,
} = publicApi;
