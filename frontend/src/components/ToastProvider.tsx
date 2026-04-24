/**
 * Toast Notification Provider
 * Professional toast notifications with rental theme
 */

import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 80,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '12px',
          padding: '16px 20px',
          maxWidth: '400px',
        },
        success: {
          duration: 4000,
          style: {
            background: '#ffffff',
            border: '2px solid #10B981',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ffffff',
            border: '2px solid #EF4444',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          style: {
            background: '#ffffff',
            border: '2px solid #6366F1',
          },
          iconTheme: {
            primary: '#6366F1',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};

