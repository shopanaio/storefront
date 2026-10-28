'use client';

import { useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useRevalidator,
  useSearchParams as useRouterSearchParams,
} from 'react-router';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import { isAbsoluteUrl } from '@shopana/storefront-sdk/routing';
import type {
  ReadonlySearchParams,
  StorefrontRouteParams,
  StorefrontRouter,
} from '../core/facade-types';
import {
  createNavigationTarget,
  useNavigationScope,
  useScopePage,
} from '../core/navigation-scope';

/** An absolute URL the router cannot move to: another site. */
function isOtherSite(href: string): boolean {
  return (
    isAbsoluteUrl(href) &&
    new URL(href, window.location.href).origin !== window.location.origin
  );
}

/**
 * Router whose navigations keep the active locale in storefront paths. Inside a
 * NavigationScope (an app moving pages itself) no call reaches React Router: push and replace
 * go to the scope, back and forward walk the browser history, refresh reloads the page at its
 * real address. React Router prefetches through links, so `prefetch` does nothing.
 */
export function useRouter(): StorefrontRouter {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();

  return useMemo(() => {
    const move = (
      href: Parameters<StorefrontRouter['push']>[0],
      replace: boolean,
      scroll: boolean | undefined
    ) => {
      const localizedHref = buildHref(href);
      if (onNavigate) {
        const target = createNavigationTarget(localizedHref, stripLocale, {
          replace,
          source: 'router',
        });
        if (target && onNavigate(target)) return;
      }
      if (isOtherSite(localizedHref)) {
        if (replace) window.location.replace(localizedHref);
        else window.location.assign(localizedHref);
        return;
      }
      void navigate(localizedHref, {
        replace,
        preventScrollReset: scroll === false,
      });
    };

    return {
      push: (href, options) => move(href, false, options?.scroll),
      replace: (href, options) => move(href, true, options?.scroll),
      prefetch: () => {},
      back: () => (onNavigate ? window.history.back() : void navigate(-1)),
      forward: () => (onNavigate ? window.history.forward() : void navigate(1)),
      refresh: () =>
        onNavigate ? window.location.reload() : void revalidator.revalidate(),
    };
  }, [buildHref, navigate, onNavigate, revalidator, stripLocale]);
}

/**
 * Current pathname without the locale segment: inside a NavigationScope with `href` (a screen
 * of a stack) that page's own, the router's otherwise.
 */
export function usePathname(): string {
  const { pathname } = useLocation();
  const { stripLocale } = useLocalization();
  const page = useScopePage();
  return page ? page.pathname : stripLocale(pathname);
}

/**
 * Current search params: inside a NavigationScope with `href` (a screen of a stack) that
 * page's own, the router's otherwise.
 */
export function useSearchParams(): ReadonlySearchParams {
  const [searchParams] = useRouterSearchParams();
  const page = useScopePage();
  const pageSearch = page?.search ?? null;
  return useMemo(
    () =>
      pageSearch === null ? searchParams : new URLSearchParams(pageSearch),
    [pageSearch, searchParams]
  );
}

/**
 * Route params of the storefront route, as Next.js names them (`[locale]/[[...slug]]`): the
 * locale segment of the address (the default locale's without one) and the path segments
 * after it; inside a NavigationScope with `href` the slug is that page's own.
 */
export function useParams<
  T extends StorefrontRouteParams = StorefrontRouteParams,
>(): T {
  const pathname = usePathname();
  const { locale } = useLocalization();
  return useMemo(() => {
    const slug = pathname.split('/').filter(Boolean).map(decodeURIComponent);
    return {
      locale: locale.segment,
      slug: slug.length ? slug : undefined,
    } as unknown as T;
  }, [locale.segment, pathname]);
}
