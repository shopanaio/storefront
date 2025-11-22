import type { PageType } from './types';

export interface RouteConfig {
  pattern: string;
  pageType: PageType;
  paramsMapper?: (params: Record<string, string>) => Record<string, string | undefined>;
}

export const ROUTE_CONFIG: RouteConfig[] = [
  {
    pattern: '/',
    pageType: 'home',
  },
  {
    pattern: '/products/:handle',
    pageType: 'product',
  },
  {
    pattern: '/collections/:handle',
    pageType: 'collection',
  },
  {
    pattern: '/cart',
    pageType: 'cart',
  },
  {
    pattern: '/pages/:handle',
    pageType: 'page',
  },
  {
    // Fallback: treat as static page handle (e.g., /about)
    pattern: '/:handle',
    pageType: 'page',
  },
];
