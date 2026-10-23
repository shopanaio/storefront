import {
  buildPath,
  type StorefrontRouteName,
  type StorefrontRouteParams,
} from '../../../utils/routeParser';
import { buildLocalizedPathname } from './buildLocalizedPathname';
import type { LocalePrefixMode } from './types';

export type HrefQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number | boolean)[];

export interface RouteHref {
  route: StorefrontRouteName;
  params?: StorefrontRouteParams;
  query?: Readonly<Record<string, HrefQueryValue>>;
  hash?: string;
}

/** A pathname without the locale segment, an absolute URL, or a named storefront route. */
export type HrefTarget = string | RouteHref;

/** URL locale segments of the store; see `StorefrontLocale.segment`. */
export interface LocaleRouting {
  locale: string;
  defaultLocale: string;
  locales: readonly string[];
  localePrefix: LocalePrefixMode;
}

const ABSOLUTE_URL = /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i;

/** True for URLs that leave the storefront path space: `https:`, `mailto:`, `tel:`, `//host`. */
export function isAbsoluteUrl(href: string): boolean {
  return ABSOLUTE_URL.test(href);
}

function buildQuery(query: RouteHref['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else {
      params.append(key, String(value));
    }
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

/**
 * Localizes a storefront href for the active locale. Absolute URLs, hash-only and query-only
 * hrefs are returned as they are; a locale segment already present is replaced.
 *
 * @example
 * buildHref({ route: 'product', params: { handle: 'tea' } }, routing); // '/uk/products/tea'
 * buildHref('/cart', { ...routing, locale: 'en' }); // '/cart' for the default locale
 */
export function buildHref(target: HrefTarget, routing: LocaleRouting): string {
  if (typeof target !== 'string') {
    const pathname = localizePathname(
      buildPath(target.route, target.params),
      routing
    );
    const hash = target.hash ? `#${target.hash.replace(/^#/, '')}` : '';
    return `${pathname}${buildQuery(target.query)}${hash}`;
  }

  if (!target.startsWith('/') || isAbsoluteUrl(target)) return target;

  const suffixIndex = target.search(/[?#]/);
  const pathname = suffixIndex === -1 ? target : target.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? '' : target.slice(suffixIndex);
  return `${localizePathname(pathname, routing)}${suffix}`;
}

export function localizePathname(
  pathname: string,
  routing: LocaleRouting
): string {
  return buildLocalizedPathname({
    pathname,
    localeCode: routing.locale,
    defaultLocale: routing.defaultLocale,
    availableLocaleCodes: routing.locales,
    localePrefix: routing.localePrefix,
  });
}

/** Splits the locale segment off a pathname when it is one of the store locales. */
export function splitLocaleFromPathname(
  pathname: string,
  locales: readonly string[]
): { locale: string | null; pathname: string } {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const [, first = '', ...rest] = normalized.split('/');
  const segment = first.toLowerCase();
  if (segment && locales.some((locale) => locale.toLowerCase() === segment)) {
    return { locale: segment, pathname: `/${rest.join('/')}` };
  }
  return { locale: null, pathname: normalized };
}
