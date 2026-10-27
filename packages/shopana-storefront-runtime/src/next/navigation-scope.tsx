'use client';

/**
 * Hands the storefront's in-site navigation to the app around it. Inside a NavigationScope,
 * `Link` clicks and `useRouter()` moves go to `onNavigate` first; when it takes the move, the
 * Next router does nothing. A nested scope with `href` marks the page a subtree shows (one
 * screen of a stack), and `usePathname`, `useSearchParams` and `useParams` answer for that
 * page instead of the address the Next router last saw. Without a scope everything behaves
 * as before, so the same templates serve a page-per-route site and an app with its own
 * navigation (a mobile stack).
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface NavigationTarget {
  /** Path, search and hash without the locale segment, e.g. `/products/socks?variant=2`. */
  href: string;
  /** The full address as the browser would open it, locale segment included. */
  url: URL;
  /** `router.replace` or `<Link replace>`: the move should not add a history entry. */
  replace: boolean;
  source: 'link' | 'router';
}

/** Returns true when the app made the move; false lets the Next router make it. */
export type NavigationHandler = (target: NavigationTarget) => boolean;

interface NavigationScopeValue {
  onNavigate: NavigationHandler | null;
  /** The page this subtree shows: path and search without the locale segment. */
  href: string | null;
}

const NavigationScopeContext = createContext<NavigationScopeValue>({
  onNavigate: null,
  href: null,
});

export interface NavigationScopeProps {
  /** Takes the moves inside; a nested scope without it keeps its parent's. */
  onNavigate?: NavigationHandler;
  /**
   * The page this subtree shows, path and search without the locale segment
   * (`/products/socks?variant=2`); a nested scope without it keeps its parent's.
   */
  href?: string;
  children: ReactNode;
}

export function NavigationScope({
  onNavigate,
  href,
  children,
}: NavigationScopeProps) {
  const parent = useContext(NavigationScopeContext);
  const value = useMemo(
    () => ({
      onNavigate: onNavigate ?? parent.onNavigate,
      href: href ?? parent.href,
    }),
    [onNavigate, href, parent.onNavigate, parent.href]
  );

  return (
    <NavigationScopeContext.Provider value={value}>
      {children}
    </NavigationScopeContext.Provider>
  );
}

/** The handler of the nearest NavigationScope, or null outside of one. */
export function useNavigationScope(): NavigationHandler | null {
  return useContext(NavigationScopeContext).onNavigate;
}

/**
 * The page of the nearest scope with `href`, as a URL (the origin is a placeholder), or null
 * when no scope names one. For the storefront's own navigation hooks.
 */
export function useScopePage(): URL | null {
  const { href } = useContext(NavigationScopeContext);
  return useMemo(
    () => (href === null ? null : new URL(href, 'http://page.local')),
    [href]
  );
}

/**
 * The target of a move to `href` (already localized), or null when it is no move between
 * pages of this site: another origin, `mailto:` and the like, or a jump to an anchor on
 * the current page. Those always stay with the browser.
 */
export function createNavigationTarget(
  href: string,
  stripLocale: (pathname: string) => string,
  options: Pick<NavigationTarget, 'replace' | 'source'>
): NavigationTarget | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return null;

  const current = window.location;
  const anchorOnly =
    url.hash !== '' &&
    url.pathname === current.pathname &&
    url.search === current.search;
  if (anchorOnly) return null;

  return {
    href: `${stripLocale(url.pathname)}${url.search}${url.hash}`,
    url,
    ...options,
  };
}
