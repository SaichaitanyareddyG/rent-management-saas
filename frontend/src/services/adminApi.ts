/**
 * Admin API Endpoints
 * Requires JWT authentication
 */

import { api } from './api';
import type {
  DashboardSummary,
  RevenueResponse,
  PaymentStatsResponse,
  Tenant,
  TenantRequest,
  Payment,
  PaymentStatus,
  PaginatedResponse,
  Property,
  PropertyRequest,
  Room,
  RoomRequest,
  Owner,
  UpdateOwnerProfileRequest,
  ChangePasswordRequest,
  MessageResponse,
} from '../types/api';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
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

    // Tenants
    getAllTenants: builder.query<Tenant[], void>({
      query: () => '/tenants',
      providesTags: ['Tenant'],
    }),
    getTenantsPaginated: builder.query<PaginatedResponse<Tenant>, {
      page?: number;
      size?: number;
      sort?: string;
      direction?: string;
    }>({
      query: ({ page = 0, size = 10, sort = 'id', direction = 'ASC' }) => ({
        url: '/tenants/paginated',
        params: { page, size, sort, direction },
      }),
      providesTags: ['Tenant'],
    }),
    getTenantById: builder.query<Tenant, number>({
      query: (id) => `/tenants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tenant', id }],
    }),
    createTenant: builder.mutation<Tenant, TenantRequest>({
      query: (data) => ({
        url: '/tenants',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tenant', 'Dashboard'],
    }),
    updateTenant: builder.mutation<Tenant, { id: number; data: Partial<TenantRequest> }>({
      query: ({ id, data }) => ({
        url: `/tenants/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Tenant', id }, 'Dashboard'],
    }),
    deleteTenant: builder.mutation<void, number>({
      query: (id) => ({
        url: `/tenants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenant', 'Dashboard'],
    }),

    // Payments
    getAllPayments: builder.query<Payment[], void>({
      query: () => '/payments',
      providesTags: ['Payment'],
    }),
    getPaymentsPaginated: builder.query<PaginatedResponse<Payment>, {
      page?: number;
      size?: number;
      sort?: string;
      direction?: string;
    }>({
      query: ({ page = 0, size = 10, sort = 'createdAt', direction = 'DESC' }) => ({
        url: '/payments/paginated',
        params: { page, size, sort, direction },
      }),
      providesTags: ['Payment'],
    }),
    getPaymentsByStatus: builder.query<Payment[], PaymentStatus>({
      query: (status) => `/payments/status/${status}`,
      providesTags: ['Payment'],
    }),
    updatePaymentStatus: builder.mutation<Payment, { id: number; status: PaymentStatus }>({
      query: ({ id, status }) => ({
        url: `/payments/${id}/status`,
        method: 'PATCH',
        params: { status },
      }),
      invalidatesTags: ['Payment', 'Dashboard'],
    }),

    // Properties
    getAllProperties: builder.query<Property[], void>({
      query: () => '/properties',
      providesTags: ['Property'],
    }),
    getPropertyById: builder.query<Property, number>({
      query: (id) => `/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),
    createProperty: builder.mutation<Property, PropertyRequest>({
      query: (data) => ({
        url: '/properties',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Property', 'Dashboard'],
    }),
    updateProperty: builder.mutation<Property, { id: number; data: PropertyRequest }>({
      query: ({ id, data }) => ({
        url: `/properties/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Property', id }, 'Dashboard'],
    }),
    deleteProperty: builder.mutation<void, number>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property', 'Dashboard'],
    }),

    // Rooms
    getAllRooms: builder.query<Room[], void>({
      query: () => '/rooms',
      providesTags: ['Room'],
    }),
    getRoomsByProperty: builder.query<Room[], number>({
      query: (propertyId) => `/rooms/property/${propertyId}`,
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation<Room, RoomRequest>({
      query: (data) => ({
        url: '/rooms',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Room', 'Property', 'Dashboard'],
    }),
    updateRoom: builder.mutation<Room, { id: number; data: RoomRequest }>({
      query: ({ id, data }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Room', id }, 'Property', 'Dashboard'],
    }),
    deleteRoom: builder.mutation<void, number>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room', 'Property', 'Dashboard'],
    }),

    // Owner Profile
    getOwnerProfile: builder.query<Owner, void>({
      query: () => '/owners/profile',
      providesTags: ['Owner'],
    }),
    updateOwnerProfile: builder.mutation<Owner, UpdateOwnerProfileRequest>({
      query: (data) => ({
        url: '/owners/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Owner'],
    }),
    changePassword: builder.mutation<MessageResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: '/owners/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRevenueQuery,
  useGetOwnerProfileQuery,
  useUpdateOwnerProfileMutation,
  useChangePasswordMutation,
  useGetPaymentStatsQuery,
  useGetAllTenantsQuery,
  useGetTenantsPaginatedQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useGetAllPaymentsQuery,
  useGetPaymentsPaginatedQuery,
  useGetPaymentsByStatusQuery,
  useUpdatePaymentStatusMutation,
  useGetAllPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetAllRoomsQuery,
  useGetRoomsByPropertyQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = adminApi;
