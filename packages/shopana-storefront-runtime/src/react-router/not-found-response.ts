import { isPageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';

/**
 * The not-found signal of the page route: a 404 response. React Router keeps the status of a
 * response thrown while the server renders (an Error it hides in production), so the page
 * answers 404 and the browser hydrates the same 404 page.
 */
export function notFoundResponse(): Response {
  return new Response(null, { status: 404, statusText: 'Not Found' });
}

/** A page found missing: the 404 response above, or a PageNotFoundError thrown by other code. */
export function isNotFoundSignal(error: unknown): boolean {
  return (
    isPageNotFoundError(error) ||
    (error instanceof Response && error.status === 404)
  );
}
