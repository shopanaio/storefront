import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { admitClosedPage as admit } from '../core/closed-page';
import type { SDKRequestContext } from '../core/request-context';

/**
 * Admits a request to a module page closed to visitors without a session, or sends it to the
 * home page. Returns the home page address for the browser guard of the admitted page.
 */
export async function admitClosedPage(
  request: SDKRequestContext,
  locale?: string
): Promise<string> {
  const { redirectTo, admitted } = await admit(
    request,
    (await headers()).get('cookie'),
    locale
  );
  if (!admitted) redirect(redirectTo);
  return redirectTo;
}
