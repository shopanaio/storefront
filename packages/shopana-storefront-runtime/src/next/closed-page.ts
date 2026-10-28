import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildClosedPageRedirect } from '@shopana/storefront-sdk/modules/session/core/closedPageRedirect';
import { readServerAuthState } from '@shopana/storefront-sdk/modules/session/server';
import type { SDKRequestContext } from '../core/request-context';
import { resolveRuntimeRoute } from '../core/route';

/**
 * Admits a request to a module page closed to visitors without a session, or sends it to the
 * home page. Returns the home page address for the browser guard of the admitted page.
 *
 * A request whose access token expired while the browser still has a session is admitted: the
 * browser refreshes the session, and its guard leaves if the refresh is rejected.
 */
export async function admitClosedPage(
  request: SDKRequestContext,
  locale?: string
): Promise<string> {
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

  const auth = await readServerAuthState((await headers()).get('cookie'));
  if (!auth.session && !auth.refreshPending) {
    redirect(redirectTo);
  }
  return redirectTo;
}
