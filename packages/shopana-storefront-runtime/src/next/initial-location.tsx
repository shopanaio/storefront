'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * The address the document was requested at (path and search, as the browser shows it), set
 * by StorefrontHistory from the request. The storefront's navigation hooks answer with it on
 * the server and during hydration, before the storefront history is read, so both render the
 * same page.
 */
const InitialLocationContext = createContext<string | null>(null);

export function InitialLocationProvider({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <InitialLocationContext.Provider value={href}>
      {children}
    </InitialLocationContext.Provider>
  );
}

/**
 * The requested address; outside StorefrontHistory (Storybook, tests) the browser's, or the
 * site root on the server.
 */
export function useInitialLocation(): string {
  const href = useContext(InitialLocationContext);
  if (href !== null) return href;
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}
