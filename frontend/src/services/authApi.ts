/**
 * Auth API Endpoints
 * Login, Register, Forgot Password, Reset Password
 */

import { api } from './api';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  MessageResponse
} from '../types/api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: LoginResponse) => {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          email: response.email,
          ownerId: response.ownerId,
        }));
        return response;
      },
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<void, void>({
      queryFn: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { data: undefined };
      },
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation 
} = authApi;
