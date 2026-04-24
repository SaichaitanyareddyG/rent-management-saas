/**
 * Number and Currency Formatters
 * Indian number system: 1,00,000 instead of 100,000
 */

/**
 * Format number to Indian currency format
 * @example formatCurrency(200000) => "₹2,00,000"
 */
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format number with Indian comma system
 * @example formatIndianNumber(200000) => "2,00,000"
 */
export const formatIndianNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Parse formatted number string to actual number
 * @example parseFormattedNumber("2,00,000") => 200000
 */
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format phone number (Indian format)
 * @example formatPhone("9876543210") => "+91 98765 43210"
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  
  return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};

/**
 * Clean phone number to digits only
 * @example cleanPhone("+91 98765 43210") => "9876543210"
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
