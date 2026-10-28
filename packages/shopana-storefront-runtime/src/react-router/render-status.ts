import { getServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';

/**
 * What the server render decides about the response after React Router fixed its status: a
 * `redirect()` (React Router keeps only the status of a response thrown while rendering) or a
 * page found missing. Kept in the request scope for the server entry; nothing in the browser.
 */

/** A `redirect()` thrown while the server rendered the page. */
export interface RenderRedirect {
  location: string;
  status: number;
}

export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const RENDER_REDIRECT = Symbol('shopana.render-redirect');
const RENDER_STATUS = Symbol('shopana.render-status');

/** Keeps the first redirect the server render ran into. */
export function recordRenderRedirect(redirect: RenderRedirect): void {
  const scope = getServerRequestScope();
  if (scope && !scope.values.has(RENDER_REDIRECT)) {
    scope.values.set(RENDER_REDIRECT, redirect);
  }
}

/** The redirect the server render of the current request ran into, if any. */
export function readRenderRedirect(): RenderRedirect | null {
  return (
    (getServerRequestScope()?.values.get(RENDER_REDIRECT) as
      | RenderRedirect
      | undefined) ?? null
  );
}

/** Keeps the status the rendered page answers with: 404 for a page found missing. */
export function recordRenderStatus(status: number): void {
  getServerRequestScope()?.values.set(RENDER_STATUS, status);
}

/** The status the server render of the current request decided, if any. */
export function readRenderStatus(): number | null {
  return (
    (getServerRequestScope()?.values.get(RENDER_STATUS) as
      | number
      | undefined) ?? null
  );
}
