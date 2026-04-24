/**
 * Public Layout Component
 * Simple header for public tenant payment pages
 */

import { Outlet } from 'react-router-dom';
import { theme } from '../config/theme';

export const PublicLayout = () => {
  return (
    <div style={styles.container}>
      {/* Simple Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>RentApp</h1>
        <p style={styles.subtitle}>Secure Payment Portal</p>
      </header>

      {/* Content */}
      <main style={styles.content}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Powered by RentApp • Secure Payment System
        </p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    backgroundColor: theme.colors.background.paper,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    padding: theme.spacing[6],
    textAlign: 'center' as const,
  },
  logo: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: theme.spacing[6],
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
  },
  footer: {
    backgroundColor: theme.colors.background.paper,
    borderTop: `1px solid ${theme.colors.border.light}`,
    padding: theme.spacing[4],
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
};
