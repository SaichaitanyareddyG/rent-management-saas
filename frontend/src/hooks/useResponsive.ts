/**
 * Custom Hooks for Responsive Design and Theme
 */

import { useEffect, useState } from 'react';
import { theme } from '../config/theme';

// Hook for responsive breakpoints
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Breakpoint hooks (Mobile-first)
export const useIsMobile = () => useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
export const useIsTablet = () => useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
export const useIsDesktop = () => useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);

// Auth hook
export const useAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    isAuthenticated: !!token,
    token,
    user,
  };
};
