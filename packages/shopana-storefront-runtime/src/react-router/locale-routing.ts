import {
  splitLocaleFromPathname,
  type StorefrontLocales,
  type StorefrontRoutingConfig,
} from '@shopana/storefront-sdk/routing';

const STATIC_FILE =
  /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mjs|mp4|pdf|png|svg|txt|webmanifest|webp|woff|woff2|xml)$/;

/**
 * Addresses under locale routing: pages, not the session handlers or a missing static file
 * (what the default matcher of the Next.js middleware leaves out).
 */
export function isLocalizedPath(pathname: string): boolean {
  return !pathname.startsWith('/auth/') && !STATIC_FILE.test(pathname);
}

/**
 * Where the address belongs under the prefix mode, when it is somewhere else: `as-needed`
 * drops the default locale segment, `always` adds it. Null when the address is right.
 */
export function localePrefixRedirect(
  url: URL,
  segment: string | null,
  locales: StorefrontLocales,
  routing: StorefrontRoutingConfig
): string | null {
  const defaultSegment = locales.defaultLocale.segment;
  const { pathname } = splitLocaleFromPathname(
    url.pathname,
    segment ? [segment] : []
  );
  if (routing.localePrefix === 'as-needed' && segment === defaultSegment) {
    return `${pathname}${url.search}`;
  }
  if (routing.localePrefix === 'always' && segment === null) {
    return `/${defaultSegment}${pathname === '/' ? '' : pathname}${url.search}`;
  }
  return null;
}
