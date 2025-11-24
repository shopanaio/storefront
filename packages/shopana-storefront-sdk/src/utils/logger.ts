export type LogLevel = 'error' | 'warn' | 'info';

export interface LogContext {
  component?: string;
  boundary?: 'section' | 'block' | 'global';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra?: Record<string, any>;
}

export interface LogErrorOptions extends LogContext {
  error: unknown;
}

// Вспомогательная точка расширения для интеграции с Sentry/Datadog.
let customLogger:
  | ((
      level: LogLevel,
      message: string,
      options?: LogErrorOptions,
    ) => void)
  | null = null;

export function configureLogger(
  logger: (level: LogLevel, message: string, options?: LogErrorOptions) => void,
) {
  customLogger = logger;
}

export function logError(message: string, options: LogErrorOptions): void {
  if (customLogger) {
    customLogger('error', message, options);
    return;
  }

  // Fallback: логируем в консоль, чтобы не терять ошибки в режиме без Sentry.
  // eslint-disable-next-line no-console
  console.error(
    `[next-ecommerce-core] ${message}`,
    options.error,
    options.component,
    options.boundary,
    options.extra,
  );
}

