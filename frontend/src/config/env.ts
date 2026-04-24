/**
 * Environment Configuration
 * Google OAuth Client ID
 */

export const config = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  },
};
