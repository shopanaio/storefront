import { buildClosedPageRedirect } from '@shopana/storefront-sdk/modules/session/core/closedPageRedirect';
import { readServerAuthState } from '@shopana/storefront-sdk/modules/session/server';
import type { SDKRequestContext } from './request-context';
import { resolveRuntimeRoute } from './route';

export interface ClosedPageAdmission {
  /** The home page a visitor without a session goes to; the browser guard's address too. */
  redirectTo: string;
  admitted: boolean;
}

/**
 * Whether a request may open a module page closed to visitors without a session, and the home
 * page address it goes to otherwise; each runtime answers with its own redirect.
 *
 * A request whose access token expired while the browser still has a session is admitted: the
 * browser refreshes the session, and its guard leaves if the refresh is rejected.
 */
export async function admitClosedPage(
  request: SDKRequestContext,
  cookie: string | null,
  locale?: string
): Promise<ClosedPageAdmission> {
  const redirectTo = buildClosedPageRedirect({
    pathname: request.pathname,
    search: request.search,
    locale,
  });
  const target = resolveRuntimeRoute(
    new URL(redirectTo, 'http://storefront.local').pathname,
    locale
  );
  // The registry refuses a closed home page; this keeps a redirect loop impossible even so.
  if (target.kind === 'module' && target.match.requiresSession) {
    throw new Error(
      `Closed page "${request.pathname}" redirects to the closed page "${redirectTo}"`
    );
  }

  const auth = await readServerAuthState(cookie);
  return { redirectTo, admitted: Boolean(auth.session || auth.refreshPending) };
}
