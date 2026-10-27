'use client';

/**
 * Hands the storefront's in-site navigations to the app around them. Inside a
 * NavigationScope, `Link` clicks and `useRouter().push/replace` first ask `onNavigate`;
 * when it takes the move, the Next router does nothing. Without a scope both behave as
 * before, so the same templates serve a page-per-route site and an app with its own
 * navigation (a mobile stack).
 */
import { createContext, useContext, type ReactNode } from 'react';

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

const NavigationScopeContext = createContext<NavigationHandler | null>(null);

export interface NavigationScopeProps {
  onNavigate: NavigationHandler;
  children: ReactNode;
}

export function NavigationScope({ onNavigate, children }: NavigationScopeProps) {
  return (
    <NavigationScopeContext.Provider value={onNavigate}>
      {children}
    </NavigationScopeContext.Provider>
  );
}

/** The handler of the nearest NavigationScope, or null outside of one. */
export function useNavigationScope(): NavigationHandler | null {
  return useContext(NavigationScopeContext);
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
