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

// TODO: Remove /demo prefix when integration is ready
const DEMO_PREFIX = '/demo';

const routes: RouteDefinition[] = [
  {
    pageType: 'home',
    matcher: match(`${DEMO_PREFIX}/`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'product',
    matcher: match(`${DEMO_PREFIX}/products/:handle`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'collection',
    matcher: match(`${DEMO_PREFIX}/collections/:handle`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'search',
    matcher: match(`${DEMO_PREFIX}/search`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'blog',
    matcher: match(`${DEMO_PREFIX}/blogs`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'article',
    matcher: match(`${DEMO_PREFIX}/blogs/:handle`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'page',
    matcher: match(`${DEMO_PREFIX}/pages/:handle`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'cart',
    matcher: match(`${DEMO_PREFIX}/cart`, { decode: decodeURIComponent }),
  },
  {
    pageType: 'list-collections',
    matcher: match(`${DEMO_PREFIX}/collections`, { decode: decodeURIComponent }),
  },
];

export function parseRoute(slug: string[] | undefined | null): ParsedRoute {
  // TODO: Remove DEMO_PREFIX logic when integration is ready
  const path = `${DEMO_PREFIX}/${(slug ?? []).join('/')}`;

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

