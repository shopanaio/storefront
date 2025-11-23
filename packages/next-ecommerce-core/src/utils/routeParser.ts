import { match } from 'path-to-regexp';

import type { PageType, TemplateParams } from '../core/types';

export interface ParsedRoute extends TemplateParams {
  pageType: PageType;
}

type Matcher = ReturnType<typeof match>;

interface RouteDefinition {
  pageType: PageType;
  matcher: Matcher;
}

const routes: RouteDefinition[] = [
  {
    pageType: 'home',
    matcher: match('/', { decode: decodeURIComponent }),
  },
  {
    pageType: 'product',
    matcher: match('/products/:handle', { decode: decodeURIComponent }),
  },
  {
    pageType: 'collection',
    matcher: match('/collections/:handle', { decode: decodeURIComponent }),
  },
  {
    pageType: 'search',
    matcher: match('/search', { decode: decodeURIComponent }),
  },
  {
    pageType: 'blog',
    matcher: match('/blogs', { decode: decodeURIComponent }),
  },
  {
    pageType: 'article',
    matcher: match('/blogs/:handle', { decode: decodeURIComponent }),
  },
  {
    pageType: 'page',
    matcher: match('/pages/:handle', { decode: decodeURIComponent }),
  },
  {
    pageType: 'cart',
    matcher: match('/cart', { decode: decodeURIComponent }),
  },
  {
    pageType: 'list-collections',
    matcher: match('/collections', { decode: decodeURIComponent }),
  },
];

export function parseRoute(slug: string[] | undefined | null): ParsedRoute {
  const path = `/${(slug ?? []).join('/')}`;

  for (const route of routes) {
    const result = route.matcher(path);

    if (!result) continue;

    return {
      pageType: route.pageType,
      params: result.params as Record<string, string | undefined>,
      searchParams: undefined,
    };
  }

  return {
    pageType: '404',
    params: {},
    searchParams: undefined,
  };
}

