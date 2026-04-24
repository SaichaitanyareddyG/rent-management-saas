/**
 * Validation Schemas using Yup
 * Centralized validation for all forms
 */

import * as Yup from 'yup';

/**
 * Tenant Form Validation Schema
 */
export const tenantValidationSchema = Yup.object({
  name: Yup.string()
    .required('Tenant name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .test('no-leading-zero', 'Phone number cannot start with 0', (value) => {
      return value ? !value.startsWith('0') : true;
    }),
  
  email: Yup.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  nativeAddress: Yup.string()
    .max(500, 'Address must be less than 500 characters'),
  
  companyOrCollege: Yup.string()
    .max(200, 'Company/College name must be less than 200 characters'),
  
  emergencyContact: Yup.string()
    .matches(/^[0-9]{10}$/, {
      message: 'Emergency contact must be exactly 10 digits',
      excludeEmptyString: true,
    }),
  
  guardianName: Yup.string()
    .max(100, 'Guardian name must be less than 100 characters'),
  
  aadharNumber: Yup.string()
    .matches(/^[0-9]{12}$/, {
      message: 'Aadhar number must be exactly 12 digits',
      excludeEmptyString: true,
    }),
  
  rentAmount: Yup.number()
    .required('Rent amount is required')
    .positive('Rent amount must be greater than 0')
    .integer('Rent amount must be a whole number')
    .max(999999999, 'Rent amount is too large'),
  
  advanceAmount: Yup.number()
    .min(0, 'Advance amount cannot be negative')
    .integer('Advance amount must be a whole number')
    .max(999999999, 'Advance amount is too large'),
  
  propertyId: Yup.number()
    .required('Property is required')
    .positive('Please select a property'),
  
  roomId: Yup.number()
    .required('Room is required')
    .positive('Please select a room'),
  
  joiningDate: Yup.date()
    .required('Joining date is required')
    .max(new Date(), 'Joining date cannot be in the future'),
  
  rentDueDay: Yup.number()
    .required('Rent due day is required')
    .min(1, 'Rent due day must be between 1 and 31')
    .max(31, 'Rent due day must be between 1 and 31')
    .integer('Rent due day must be a whole number'),
  
  notes: Yup.string()
    .max(1000, 'Notes must be less than 1000 characters'),
});

/**
 * Property Form Validation Schema
 */
export const propertyValidationSchema = Yup.object({
  name: Yup.string()
    .required('Property name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be less than 200 characters'),
  
  addressLine1: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters'),
  
  city: Yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  
  state: Yup.string()
    .required('State is required')
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be less than 100 characters'),
  
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
  
  upiId: Yup.string()
    .required('UPI ID is required')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, 'Invalid UPI ID format (e.g., username@bank)')
    .max(100, 'UPI ID must be less than 100 characters'),
  
  defaultRentDueDay: Yup.number()
    .required('Default rent due day is required')
    .min(1, 'Rent due day must be between 1 and 31')
    .max(31, 'Rent due day must be between 1 and 31')
    .integer('Rent due day must be a whole number'),
});

/**
 * Room Form Validation Schema
 */
export const roomValidationSchema = Yup.object({
  roomNumber: Yup.string()
    .required('Room number is required')
    .min(1, 'Room number must be at least 1 character')
    .max(50, 'Room number must be less than 50 characters'),
  
  capacity: Yup.number()
    .required('Capacity is required')
    .positive('Capacity must be at least 1')
    .integer('Capacity must be a whole number')
    .max(100, 'Capacity cannot exceed 100'),
  
  propertyId: Yup.number()
    .required('Property is required')
    .positive('Please select a property'),
});

/**
 * Payment Confirmation Validation Schema (Public Page)
 */
export const paymentValidationSchema = Yup.object({
  utr: Yup.string()
    .required('UTR number is required')
    .min(6, 'UTR must be at least 6 characters')
    .max(50, 'UTR must be less than 50 characters')
    .matches(/^[A-Z0-9]+$/, 'UTR should contain only uppercase letters and numbers'),
  
  notes: Yup.string()
    .max(500, 'Notes must be less than 500 characters'),
});

/**
 * Login Validation Schema
 */
export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

/**
 * Register Validation Schema
 */
export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});
