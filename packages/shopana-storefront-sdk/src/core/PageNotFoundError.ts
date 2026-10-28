/**
 * A page a section found missing: its query answered that the page's entity does not exist.
 * Section and block boundaries pass it on, so it reaches the app's boundary around the page.
 */
export class PageNotFoundError extends Error {
  readonly digest = 'SHOPANA_PAGE_NOT_FOUND';

  constructor() {
    super('Page not found');
    this.name = 'PageNotFoundError';
  }
}

export function isPageNotFoundError(error: unknown): error is PageNotFoundError {
  return error instanceof PageNotFoundError;
}

/** Next's `notFound()`, `forbidden()`, `unauthorized()` and `redirect()` signals. */
function isNextNavigationError(error: unknown): boolean {
  const digest =
    error && typeof error === 'object' && 'digest' in error
      ? (error as { digest: unknown }).digest
      : null;
  return (
    typeof digest === 'string' &&
    (digest.startsWith('NEXT_HTTP_ERROR_FALLBACK;') ||
      digest.startsWith('NEXT_REDIRECT;'))
  );
}

/**
 * Errors that are not a failure of the section they come from but a decision about the whole
 * page: a section boundary rethrows them instead of hiding the section.
 */
export function isPageLevelError(error: unknown): boolean {
  return isPageNotFoundError(error) || isNextNavigationError(error);
}
