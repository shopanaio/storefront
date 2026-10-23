import { AUTH_RESULT_PARAM, parseAuthResult } from './sessionCookies';

export interface ClosedPageRedirectOptions {
  /** Pathname of the closed page as the browser requested it, with its locale prefix. */
  pathname: string;
  /** Query string of the closed page, with or without the leading `?`. */
  search?: string;
  /** Locale of the request. */
  locale?: string;
}

/**
 * Where a page closed to visitors without a session sends one: the home page of the same
 * locale, in the URL form of the request (a prefixed `/uk/account` goes to `/uk`, an
 * unprefixed `/account` to `/`). The home page is never closed (the module registry refuses
 * such a module), so the redirect cannot lead back to a closed page.
 *
 * A sign-in that did not complete returns to the page it started on with `?auth=`; the result
 * is carried over so the store still tells the buyer why.
 */
export function buildClosedPageRedirect({
  pathname,
  search = '',
  locale,
}: ClosedPageRedirectOptions): string {
  const prefix = locale ? `/${locale}` : '';
  const home =
    prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))
      ? prefix
      : '/';
  const authResult = parseAuthResult(
    new URLSearchParams(search).get(AUTH_RESULT_PARAM)
  );
  if (!authResult) return home;
  return `${home}?${new URLSearchParams({ [AUTH_RESULT_PARAM]: authResult })}`;
}
