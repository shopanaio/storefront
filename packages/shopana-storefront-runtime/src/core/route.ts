import type { PageType } from '@shopana/storefront-sdk/core/types';
import {
  moduleRegistry,
  type ModuleMatchResult,
} from '@shopana/storefront-sdk/registry';
import {
  parseRoute,
  type ParsedRoute,
} from '@shopana/storefront-sdk/utils/routeParser';

export type RuntimePageType = PageType | 'module';

export type RuntimeRouteResolution<T = unknown> =
  | {
      kind: 'module';
      pathname: string;
      pageType: 'module';
      match: ModuleMatchResult<T>;
    }
  | {
      kind: 'sdk';
      pathname: string;
      pageType: PageType;
      route: ParsedRoute;
    };

/** Removes the locale segment of the request (the `[locale]` route param) from a pathname. */
export function stripLocalePrefix(pathname: string, locale?: string): string {
  if (!locale) return pathname;

  const [, first = '', ...rest] = pathname.split('/');
  if (first.toLowerCase() !== locale.toLowerCase()) return pathname;
  return `/${rest.join('/')}`;
}

export function resolveRuntimeRoute<T = unknown>(
  pathname: string,
  locale?: string
): RuntimeRouteResolution<T> {
  const pathnameWithoutLocale = stripLocalePrefix(pathname, locale);
  const moduleMatch = moduleRegistry.matchPath<T>(
    'page',
    pathnameWithoutLocale
  );

  if (moduleMatch) {
    return {
      kind: 'module',
      pathname: pathnameWithoutLocale,
      pageType: 'module',
      match: moduleMatch,
    };
  }

  const route = parseRoute(pathnameWithoutLocale);
  return {
    kind: 'sdk',
    pathname: pathnameWithoutLocale,
    pageType: route.pageType,
    route,
  };
}
