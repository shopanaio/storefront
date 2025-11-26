import { match } from 'path-to-regexp';

import type { PageType, TemplateParams } from '../core/types';

export interface ParsedRoute extends TemplateParams {
  pageType: PageType;
  /** The locale extracted from the path, if present */
  locale?: string;
}

type Matcher = ReturnType<typeof match>;

interface RouteDefinition {
  pageType: PageType;
  pattern: string;
  matcher: Matcher;
}

/**
 * Route definitions for the storefront.
 * Routes are matched in order, so more specific routes should come first.
 */
const routePatterns: Array<{ pageType: PageType; pattern: string }> = [
  // Product routes
  { pageType: 'product', pattern: '/products/:handle' },
  { pageType: 'product', pattern: '/p/:handle' },

  // Collection routes (specific first, then list)
  { pageType: 'collection', pattern: '/collections/:handle' },
  { pageType: 'collection', pattern: '/c/:handle' },
  { pageType: 'list-collections', pattern: '/collections' },

  // Blog routes (article with handle first, then blog list)
  { pageType: 'article', pattern: '/blogs/:blog/:handle' },
  { pageType: 'article', pattern: '/blogs/:handle' },
  { pageType: 'blog', pattern: '/blogs' },

  // Other pages
  { pageType: 'search', pattern: '/search' },
  { pageType: 'cart', pattern: '/cart' },
  { pageType: 'page', pattern: '/pages/:handle' },

  // Home page (must be last as it matches root)
  { pageType: 'home', pattern: '/' },
];

// Build matchers from patterns
const routes: RouteDefinition[] = routePatterns.map(({ pageType, pattern }) => ({
  pageType,
  pattern,
  matcher: match(pattern, { decode: decodeURIComponent, end: true }),
}));

// Regex to match locale prefix (2-3 letter code like /ru, /en, /rus, etc.)
const LOCALE_REGEX = /^\/([a-z]{2,3})(?=\/|$)/;

export interface ParseRouteOptions {
  /** Strip locale prefix from pathname before matching (default: true) */
  stripLocale?: boolean;
  /** Custom locale regex pattern */
  localePattern?: RegExp;
}

/**
 * Parse route from full pathname string using path-to-regexp.
 * Automatically strips locale prefix if present.
 *
 * @example
 * ```ts
 * // Basic usage
 * const route = parseRoute('/products/my-product');
 * // route.pageType === 'product'
 * // route.params.handle === 'my-product'
 *
 * // With locale
 * const route = parseRoute('/ru/products/my-product');
 * // route.pageType === 'product'
 * // route.params.handle === 'my-product'
 * // route.locale === 'ru'
 *
 * // With request context
 * const ctx = await getRequestContext();
 * const route = parseRoute(ctx.pathname);
 * ```
 */
export function parseRoute(
  pathname: string,
  options: ParseRouteOptions = {}
): ParsedRoute {
  const { stripLocale = true, localePattern = LOCALE_REGEX } = options;

  let normalizedPath = pathname;
  let locale: string | undefined;

  // Extract and strip locale prefix
  if (stripLocale) {
    const localeMatch = pathname.match(localePattern);
    if (localeMatch) {
      locale = localeMatch[1];
      normalizedPath = pathname.slice(localeMatch[0].length) || '/';
    }
  }

  // Ensure path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  // Try to match against route patterns
  for (const route of routes) {
    const result = route.matcher(normalizedPath);

    if (!result) continue;

    return {
      pageType: route.pageType,
      params: result.params as Record<string, string | undefined>,
      searchParams: undefined,
      locale,
    };
  }

  return {
    pageType: '404',
    params: {},
    searchParams: undefined,
    locale,
  };
}

/**
 * @deprecated Use parseRoute instead
 */
export function parseRoutePath(pathname: string): ParsedRoute {
  return parseRoute(pathname);
}

/**
 * Build a pathname from a route definition.
 *
 * @example
 * ```ts
 * buildPath('product', { handle: 'my-product' }); // '/products/my-product'
 * buildPath('collection', { handle: 'shirts' }); // '/collections/shirts'
 * buildPath('home'); // '/'
 * ```
 */
export function buildPath(
  pageType: PageType,
  params?: Record<string, string>
): string {
  const route = routePatterns.find((r) => r.pageType === pageType);
  if (!route) {
    return '/';
  }

  let path = route.pattern;

  // Replace params in pattern
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  return path;
}
