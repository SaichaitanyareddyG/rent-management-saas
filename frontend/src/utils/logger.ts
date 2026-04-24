/**
 * Logger Utility
 * Centralized logging with environment-based behavior
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (this.isDev) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message, ...args);
          break;
        case 'warn':
          console.warn(prefix, message, ...args);
          break;
        case 'debug':
          console.debug(prefix, message, ...args);
          break;
        default:
          console.log(prefix, message, ...args);
      }
    }

    // In production, send to error tracking service
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      // TODO: Send to Sentry or similar service
      // Sentry.captureMessage(message, level);
    }
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, error?: any) {
    this.log('error', message, error);
    
    // Send error to tracking service in production
    if (this.isProduction && error) {
      // TODO: Send to Sentry
      // Sentry.captureException(error);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.isDev) {
      this.log('debug', message, ...args);
    }
  }

  // API request/response logging
  apiRequest(method: string, url: string, data?: any) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    this.debug(`API Response: ${method} ${url} [${status}]`, data);
  }

  apiError(method: string, url: string, error: any) {
    this.error(`API Error: ${method} ${url}`, error);
  }
}

export const logger = new Logger();

// Usage examples:
// logger.info('User logged in', { userId: 123 });
// logger.error('Login failed', error);
// logger.apiRequest('POST', '/auth/login', { email: 'user@example.com' });
