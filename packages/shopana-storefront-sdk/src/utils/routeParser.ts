import { compile, match } from 'path-to-regexp';

import type { PageType, TemplateParams } from '../core/types';

/** A parsed pathname without the locale segment. */
export type ParsedRoute = TemplateParams;

/**
 * Canonical storefront pathnames without the locale segment. Reserved pages are parsed by the
 * runtime; `policy`, `checkout` and `account` belong to modules and are only built here.
 */
export const storefrontRoutes = {
  home: '/',
  product: '/products/:handle',
  category: '/categories/:handle',
  collection: '/collections/:handle',
  'list-collections': '/collections',
  page: '/pages/:handle',
  policy: '/policies/:handle',
  blog: '/blogs/:blog',
  article: '/blogs/:blog/:handle',
  search: '/search',
  cart: '/cart',
  checkout: '/checkout',
  account: '/account{/*path}',
} as const;

export type StorefrontRouteName = keyof typeof storefrontRoutes;

export type StorefrontRouteParams = Record<string, string | readonly string[]>;

type ReservedPageType = Exclude<PageType, '404'>;

/**
 * Reserved page routes in match order: specific patterns first, the root last.
 * `/p/:handle` and `/c/:handle` are short product and collection URLs.
 */
const pageRoutePatterns: ReadonlyArray<{
  pageType: ReservedPageType;
  pattern: string;
}> = [
  { pageType: 'product', pattern: storefrontRoutes.product },
  { pageType: 'product', pattern: '/p/:handle' },
  { pageType: 'category', pattern: storefrontRoutes.category },
  { pageType: 'collection', pattern: storefrontRoutes.collection },
  { pageType: 'collection', pattern: '/c/:handle' },
  { pageType: 'list-collections', pattern: storefrontRoutes['list-collections'] },
  { pageType: 'article', pattern: storefrontRoutes.article },
  { pageType: 'blog', pattern: storefrontRoutes.blog },
  { pageType: 'search', pattern: storefrontRoutes.search },
  { pageType: 'cart', pattern: storefrontRoutes.cart },
  { pageType: 'page', pattern: storefrontRoutes.page },
  { pageType: 'home', pattern: storefrontRoutes.home },
];

const pageRoutes = pageRoutePatterns.map(({ pageType, pattern }) => ({
  pageType,
  matcher: match(pattern, { decode: decodeURIComponent, end: true }),
}));

const routeBuilders = Object.fromEntries(
  Object.entries(storefrontRoutes).map(([name, pattern]) => [
    name,
    compile(pattern, { encode: encodeURIComponent }),
  ])
) as Record<StorefrontRouteName, ReturnType<typeof compile>>;

/**
 * Parses a pathname that no longer carries the locale segment.
 *
 * @example
 * parseRoute('/products/my-product'); // { pageType: 'product', params: { handle: 'my-product' } }
 */
export function parseRoute(pathname: string): ParsedRoute {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  for (const route of pageRoutes) {
    const result = route.matcher(normalizedPath);
    if (!result) continue;

    return {
      pageType: route.pageType,
      params: result.params as Record<string, string | undefined>,
      searchParams: undefined,
    };
  }

  return { pageType: '404', params: {}, searchParams: undefined };
}

/**
 * Builds a canonical pathname without the locale segment.
 *
 * @example
 * buildPath('product', { handle: 'my-product' }); // '/products/my-product'
 * buildPath('account', { path: ['orders', '42'] }); // '/account/orders/42'
 */
export function buildPath(
  route: StorefrontRouteName,
  params: StorefrontRouteParams = {}
): string {
  const normalized: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (value.length > 0) {
      normalized[key] = [...value];
    }
  }
  if (route === 'account' && typeof normalized.path === 'string') {
    normalized.path = normalized.path.split('/').filter(Boolean);
  }
  return routeBuilders[route](normalized);
}
