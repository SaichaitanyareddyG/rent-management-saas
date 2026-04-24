/**
 * API Response Types
 * Maps to Spring Boot DTOs
 */

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  ownerId: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  expectedMonthlyRevenue: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  verifyPayments: number;
  currentMonth: string;
}

export interface RevenueResponse {
  month: string;
  paidAmount: number;
  pendingAmount: number;
  expectedAmount: number;
  paidCount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface PaymentStatsResponse {
  month: string;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  verifyPayments: number;
  paidPercentage: number;
  pendingPercentage: number;
  verifyPercentage: number;
}

// Property Types
export interface Property {
  id: number;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  upiId: string;
  defaultRentDueDay: number;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  totalRooms?: number;
  totalBeds?: number;
  occupiedBeds?: number;
}

export interface PropertyRequest {
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  upiId: string;
  defaultRentDueDay?: number;
}

// Room Types
export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  occupiedCount: number;
  availableBeds: number;  // Computed: capacity - occupiedCount
  propertyId: number;
  propertyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomRequest {
  roomNumber: string;
  capacity: number;
  propertyId: number;
}

// Tenant Types
export const TenantStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export type TenantStatus = typeof TenantStatus[keyof typeof TenantStatus];

export interface Tenant {
  id: number;
  name: string;
  phone: string;
  contactNumber: string; // Alias for phone
  email: string;
  nativeAddress: string;
  companyOrCollege: string;
  emergencyContact: string;
  guardianName: string;
  aadharNumber: string;  // Masked from backend (XXXX-XXXX-1234)
  rentAmount: number;
  status: TenantStatus;
  joiningDate: string;
  rentDueDay: number;
  advanceAmount: number;
  notes: string;
  propertyId: number;
  propertyName: string;
  roomId: number;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantRequest {
  name: string;
  phone: string;
  email?: string;
  nativeAddress?: string;
  companyOrCollege?: string;
  emergencyContact?: string;
  guardianName?: string;
  aadharNumber?: string;
  rentAmount: number;
  propertyId: number;
  roomId: number;
  joiningDate?: string;
  rentDueDay?: number;
  advanceAmount?: number;
  notes?: string;
}

// Payment Types
export const PaymentStatus = {
  PENDING: 'PENDING',
  VERIFY: 'VERIFY',
  OVERDUE: 'OVERDUE',
  PAID: 'PAID',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface Payment {
  id: number;
  amount: number;
  month: string;
  status: PaymentStatus;
  utrNumber: string; // Alias for utr
  utr: string;
  notes: string;
  tenantId: number;
  tenantName: string;
  propertyId: number;
  propertyName: string;
  roomId: number;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

export interface PaymentInitiateRequest {
  tenantId: number;
  month: string;
  amount: number;
}

export interface PaymentConfirmRequest {
  tenantId: number;
  month: string;
  utr: string;
  notes?: string;
}

export interface PaymentIntent {
  id: number;
  tenantId: number;
  tenantName: string;
  amount: number;
  month: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

// Paginated Response
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Error Response
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

// Owner Types
export interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOwnerProfileRequest {
  name: string;
  email: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Public Payment Portal Types
export interface PublicTenantDetailsResponse {
  tenantId: number;
  name: string;
  roomNumber: string;
  propertyName: string;
  rentAmount: number;
  currentMonth: string;
  upiId: string;
  ownerName: string;
  alreadyPaidThisMonth: boolean;
  paymentStatus: string;
}
