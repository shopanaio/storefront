import type { ValidationError } from 'yup';

/**
 * Extracts validation errors from a Yup ValidationError
 * and returns them as a Record<string, string>
 */
export function extractYupErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') {
    return {};
  }

  if ('inner' in error) {
    const validationError = error as ValidationError;
    return validationError.inner.reduce<Record<string, string>>((acc, err) => {
      if (err.path) {
        acc[err.path] = err.message;
      }
      return acc;
    }, {});
  }

  return {};
}
