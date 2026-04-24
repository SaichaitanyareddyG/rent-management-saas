/**
 * Dashboard API Endpoints
 * Summary, Revenue, Payment Stats
 */

import { api } from './api';
import type {
  DashboardSummary,
  RevenueResponse,
  PaymentStatsResponse,
} from '../types/api';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
      providesTags: ['Dashboard'],
    }),
    getRevenue: builder.query<RevenueResponse, string | void>({
      query: (month) => ({
        url: '/dashboard/revenue',
        params: month ? { month } : {},
      }),
      providesTags: ['Dashboard'],
    }),
    getPaymentStats: builder.query<PaymentStatsResponse, string | void>({
      query: (month) => ({
        url: '/dashboard/payment-stats',
        params: month ? { month } : {},
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRevenueQuery,
  useGetPaymentStatsQuery,
} = dashboardApi;
