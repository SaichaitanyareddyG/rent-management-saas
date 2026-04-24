/**
 * Animated Badge Component
 * Shows notification counts with smooth animations
 */

import { Badge as MuiBadge, styled } from '@mui/material';

export const AnimatedBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: '0.75rem',
    padding: '0 6px',
    height: '20px',
    minWidth: '20px',
    borderRadius: '10px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: 0.9,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
}));

interface BadgeProps {
  count: number;
  children: React.ReactNode;
  showZero?: boolean;
}

export function Badge({ count, children, showZero = false }: BadgeProps) {
  return (
    <AnimatedBadge
      badgeContent={count}
      showZero={showZero}
      max={99}
    >
      {children}
    </AnimatedBadge>
  );
}
