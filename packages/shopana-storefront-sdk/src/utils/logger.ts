export type LogLevel = 'error' | 'warn' | 'info';

export interface LogContext {
  component?: string;
  boundary?: 'section' | 'block' | 'global';

  extra?: Record<string, any>;
}

export interface LogErrorOptions extends LogContext {
  error: unknown;
}

// Extension point for integrating with Sentry/Datadog.
let customLogger:
  | ((level: LogLevel, message: string, options?: LogErrorOptions) => void)
  | null = null;

export function configureLogger(
  logger: (level: LogLevel, message: string, options?: LogErrorOptions) => void
) {
  customLogger = logger;
}

export function logError(message: string, options: LogErrorOptions): void {
  if (customLogger) {
    customLogger('error', message, options);
    return;
  }

  // Fallback: log to the console so errors are not lost when Sentry is not configured.

  console.error(
    `[@shopana/storefront-sdk] ${message}`,
    options.error,
    options.component,
    options.boundary,
    options.extra
  );
}
