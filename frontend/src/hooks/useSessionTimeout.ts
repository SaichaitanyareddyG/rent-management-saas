/**
 * Session Timeout Hook
 * Automatically logs out user after inactivity
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

interface UseSessionTimeoutOptions {
  /**
   * Timeout duration in milliseconds
   * Default: 30 minutes (1800000ms)
   */
  timeout?: number;
  
  /**
   * Warning time before logout (in milliseconds)
   * Default: 2 minutes (120000ms)
   */
  warningTime?: number;
  
  /**
   * Enable/disable session timeout
   * Default: true
   */
  enabled?: boolean;
}

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING = 2 * 60 * 1000;  // 2 minutes before timeout

/**
 * Hook to handle automatic session timeout
 * Tracks user activity and logs out after inactivity
 */
export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    timeout = DEFAULT_TIMEOUT,
    warningTime = DEFAULT_WARNING,
    enabled = true,
  } = options;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show logout message
    toast.error('⏱️ Session expired due to inactivity. Please login again.', {
      duration: 5000,
    });
    
    // Navigate to login
    navigate('/login', { replace: true });
  }, [navigate, dispatch]);

  const showWarning = useCallback(() => {
    toast('⚠️ Your session will expire in 2 minutes due to inactivity', {
      icon: '⏰',
      duration: 10000,
    });
  }, []);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarning();
    }, timeout - warningTime);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [enabled, timeout, warningTime, logout, showWarning]);

  useEffect(() => {
    if (!enabled) return;

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle reset to avoid too many calls
    let throttleTimeout: NodeJS.Timeout;
    const throttledReset = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        resetTimer();
        throttleTimeout = undefined!;
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledReset);
    });

    // Initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledReset);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [enabled, resetTimer]);

  return {
    resetTimer,
  };
};
