'use client';

/**
 * The storefront's navigation hooks, same names and shapes as Next's, with no Next router
 * behind them: the storefront history (SDK, TanStack history) is the only owner of the
 * browser history on the client, and the Next router only rendered the first page on the
 * server. Moves render on the client in the storefront page or an app moving pages itself (see
 * page-rendering).
 */
import { useMemo, useSyncExternalStore } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import {
  getStorefrontHistory,
  peekStorefrontHistory,
  subscribeStorefrontHistory,
  type HistoryLocation,
  type HrefTarget,
} from '@shopana/storefront-sdk/routing';
import { useInitialLocation } from './initial-location';
import { isServerOnlyPage } from './page-rendering';
import {
  createNavigationTarget,
  useNavigationScope,
  useScopePage,
} from './navigation-scope';

/** URLSearchParams that throw on change, as Next's: the address changes through the router. */
export class ReadonlyURLSearchParams extends URLSearchParams {
  private static readonly error = 'ReadonlyURLSearchParams: change the address with the router';

  append(): void {
    throw new Error(ReadonlyURLSearchParams.error);
  }
  delete(): void {
    throw new Error(ReadonlyURLSearchParams.error);
  }
  set(): void {
    throw new Error(ReadonlyURLSearchParams.error);
  }
  sort(): void {
    throw new Error(ReadonlyURLSearchParams.error);
  }
}

export interface NavigateOptions {
  /** False keeps the scroll position when the move opens another page. */
  scroll?: boolean;
}

export interface StorefrontRouter {
  push(href: HrefTarget, options?: NavigateOptions): void;
  replace(href: HrefTarget, options?: NavigateOptions): void;
  back(): void;
  forward(): void;
  /** Loads the document at its address again: no RSC refresh, the Next router is not here. */
  refresh(): void;
  /** Pages load on the client from the runtime's page registry; nothing to prefetch. */
  prefetch(href: HrefTarget): void;
}

// Reading creates nothing: the history is created by the subscription (and UnclaimedMoves).
const getHistoryLocation = () => peekStorefrontHistory()?.location ?? null;
const getServerHistoryLocation = () => null;

/**
 * The current entry of the storefront history: address, the state it was written with, key
 * and index. Null on the server, during hydration and on a page without StorefrontHistory
 * (Storybook, tests).
 */
export function useHistoryLocation(): HistoryLocation | null {
  return useSyncExternalStore(
    subscribeStorefrontHistory,
    getHistoryLocation,
    getServerHistoryLocation
  );
}

/**
 * The page the hooks answer for, path and search without the locale segment (the origin is a
 * placeholder): a screen's own page (a NavigationScope with `href`), else the storefront
 * history's address, else the address the document was requested at (server, hydration).
 */
export function usePage(): URL {
  const scopePage = useScopePage();
  const location = useHistoryLocation();
  const initial = useInitialLocation();
  const { stripLocale } = useLocalization();
  const href = location?.href ?? initial;
  return useMemo(() => {
    if (scopePage) return scopePage;
    const url = new URL(href, 'http://page.local');
    return new URL(`${stripLocale(url.pathname)}${url.search}`, 'http://page.local');
  }, [scopePage, href, stripLocale]);
}

/**
 * Router whose navigations keep the active locale in storefront paths and go through the
 * storefront history. Inside a NavigationScope (an app moving pages itself) push and replace
 * go to the scope first; a move the scope does not take loads its page.
 */
export function useRouter(): StorefrontRouter {
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();

  return useMemo(() => {
    const move = (href: HrefTarget, replace: boolean, options?: NavigateOptions) => {
      const localizedHref = buildHref(href);
      if (onNavigate) {
        const target = createNavigationTarget(localizedHref, stripLocale, {
          replace,
          source: 'router',
        });
        if (!target || !onNavigate(target)) window.location.assign(localizedHref);
        return;
      }
      const history = getStorefrontHistory();
      const url = new URL(localizedHref, window.location.href);
      if (!history || isServerOnlyPage(stripLocale(url.pathname))) {
        if (replace) window.location.replace(localizedHref);
        else window.location.assign(localizedHref);
        return;
      }
      const state = options?.scroll === false ? { scroll: false } : undefined;
      if (replace) history.replace(localizedHref, state);
      else history.push(localizedHref, state);
    };

    return {
      push: (href, options) => move(href, false, options),
      replace: (href, options) => move(href, true, options),
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      refresh: () => window.location.reload(),
      prefetch: () => {},
    };
  }, [buildHref, onNavigate, stripLocale]);
}

/** Current pathname without the locale segment (see usePage). */
export function usePathname(): string {
  return usePage().pathname;
}

/** Current search params (see usePage). */
export function useSearchParams(): ReadonlyURLSearchParams {
  const search = usePage().search;
  return useMemo(() => new ReadonlyURLSearchParams(search), [search]);
}

/**
 * Route params of the storefront route (`[locale]/[[...slug]]`): the active locale's segment
 * and the slug of the page of usePathname.
 */
export function useParams<
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
>(): T {
  const { locale } = useLocalization();
  const pathname = usePage().pathname;
  return useMemo(() => {
    const slug = pathname.split('/').filter(Boolean);
    return { locale: locale.segment, slug: slug.length ? slug : undefined } as unknown as T;
  }, [locale.segment, pathname]);
}
