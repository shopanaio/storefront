'use client';

import {
  ReadonlyURLSearchParams,
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import { useMemo } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { HrefTarget } from '@shopana/storefront-sdk/routing';
import {
  createNavigationTarget,
  useNavigationScope,
  useScopePage,
} from './navigation-scope';

type NextRouter = ReturnType<typeof useNextRouter>;
type NavigateOptions = Parameters<NextRouter['push']>[1];
type PrefetchOptions = Parameters<NextRouter['prefetch']>[1];

export interface StorefrontRouter extends Omit<NextRouter, 'push' | 'replace' | 'prefetch'> {
  push(href: HrefTarget, options?: NavigateOptions): void;
  replace(href: HrefTarget, options?: NavigateOptions): void;
  prefetch(href: HrefTarget, options?: PrefetchOptions): void;
}

/**
 * Router whose navigations keep the active locale in storefront paths. Inside a
 * NavigationScope (an app moving pages itself) no call reaches the Next router: push and
 * replace go to the scope, back and forward walk the browser history, refresh reloads the
 * page at its real address, and prefetching is off.
 */
export function useRouter(): StorefrontRouter {
  const router = useNextRouter();
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();

  return useMemo(() => {
    const takenByScope = (href: string, replace: boolean) => {
      if (!onNavigate) return false;
      const target = createNavigationTarget(href, stripLocale, {
        replace,
        source: 'router',
      });
      return target !== null && onNavigate(target);
    };

    return {
      ...router,
      push: (href, options) => {
        const localizedHref = buildHref(href);
        if (!takenByScope(localizedHref, false)) {
          router.push(localizedHref, options);
        }
      },
      replace: (href, options) => {
        const localizedHref = buildHref(href);
        if (!takenByScope(localizedHref, true)) {
          router.replace(localizedHref, options);
        }
      },
      prefetch: (href, options) => {
        if (!onNavigate) router.prefetch(buildHref(href), options);
      },
      back: () => (onNavigate ? window.history.back() : router.back()),
      forward: () => (onNavigate ? window.history.forward() : router.forward()),
      refresh: () => (onNavigate ? window.location.reload() : router.refresh()),
    };
  }, [buildHref, onNavigate, router, stripLocale]);
}

/**
 * Current pathname without the locale segment: inside a NavigationScope with `href` (a screen
 * of a stack) that page's own, the Next router's otherwise.
 */
export function usePathname(): string {
  const pathname = useNextPathname();
  const { stripLocale } = useLocalization();
  const page = useScopePage();
  return page ? page.pathname : stripLocale(pathname);
}

/**
 * Current search params: inside a NavigationScope with `href` (a screen of a stack) that
 * page's own, the Next router's otherwise. Same type as Next's.
 */
export function useSearchParams(): ReadonlyURLSearchParams {
  const searchParams = useNextSearchParams();
  const page = useScopePage();
  const pageSearch = page?.search ?? null;
  return useMemo(
    () =>
      pageSearch === null
        ? searchParams
        : new ReadonlyURLSearchParams(new URLSearchParams(pageSearch)),
    [pageSearch, searchParams]
  );
}

/**
 * Route params of the storefront route (`[locale]/[[...slug]]`): inside a NavigationScope
 * with `href` the slug is that page's own path, the locale stays the Next router's.
 */
export function useParams<
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
>(): T {
  const params = useNextParams<T>();
  const page = useScopePage();
  const pagePathname = page?.pathname ?? null;
  return useMemo(() => {
    if (pagePathname === null) return params;
    const slug = pagePathname.split('/').filter(Boolean);
    return { ...params, slug: slug.length ? slug : undefined } as T;
  }, [pagePathname, params]);
}
