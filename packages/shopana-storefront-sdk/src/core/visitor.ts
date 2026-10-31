import {
  readCookie,
  resolveCookieAttributes,
  serializeCookie,
  type CookiePolicy,
} from './cookiePolicy';

/** The visitor of this browser: GraphQL and the store's apps (the assistant chat) share it. */
export const VISITOR_COOKIE_NAME = 'shopana_storefront_visitor_id';
/** The header every storefront request names the visitor with. */
export const VISITOR_ID_HEADER = 'x-shopana-storefront-visitor-id';
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** The visitor id of this browser, created with its cookie when there is none yet. Browser only. */
export function ensureVisitorId(cookiePolicy?: CookiePolicy): string {
  const existing = readCookie(document.cookie, VISITOR_COOKIE_NAME);
  if (existing) return existing;
  const visitorId = crypto.randomUUID();
  document.cookie = serializeCookie(VISITOR_COOKIE_NAME, visitorId, {
    ...resolveCookieAttributes(cookiePolicy, {
      secure: window.location.protocol === 'https:',
    }),
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
  return visitorId;
}
