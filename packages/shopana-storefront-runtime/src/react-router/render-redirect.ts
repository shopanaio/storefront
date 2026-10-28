import { getServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';

/** A `redirect()` thrown while the server rendered the page. */
export interface RenderRedirect {
  location: string;
  status: number;
}

export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const RENDER_REDIRECT = Symbol('shopana.render-redirect');

/**
 * Keeps the first redirect the server render ran into, for the server entry to answer with.
 * Does nothing in the browser.
 */
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
