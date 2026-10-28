'use client';

import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import {
  getStorefrontHistory,
  subscribeStorefrontHistory,
} from '@shopana/storefront-sdk/routing';
import { useInitialLocation } from './initial-location';
import { useHistoryLocation, usePage } from './navigation-client';
import {
  isServerOnlyPage,
  loadCurrentAddress,
  useClaimPageRendering,
} from './page-rendering';

export interface RuntimeClientPageProps {
  /** The page the server rendered for the address the document was requested at. */
  initial: ReactNode;
  /**
   * A page loaded on the client (see useRuntimePageContent); `href` is its path and search
   * without the locale segment. Wrap it in Suspense and an error boundary.
   */
  renderPage: (href: string) => ReactNode;
}

/** Scroll position of each history entry, by key, to come back to on back/forward. */
const scrollPositions = new Map<string, number>();
/** Where the window scrolls once the page of the last move renders; null leaves it. */
let pendingScroll: number | null = null;

/**
 * Scrolls to `top` once the page is tall enough: a page coming back from the cache renders at
 * once, one that loads grows as its sections arrive. Gives up when the user scrolls or after a
 * few seconds.
 */
function scrollWhenReachable(top: number): () => void {
  const reached = () => {
    window.scrollTo(0, top);
    return Math.abs(window.scrollY - top) < 1;
  };
  if (reached()) return () => {};

  const observer = new ResizeObserver(() => {
    if (reached()) stop();
  });
  const timer = window.setTimeout(() => stop(), 3000);
  const stop = () => {
    observer.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', stop);
  };
  observer.observe(document.body);
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
  return stop;
}

/**
 * Saves the scroll of the entry left and picks where the next page scrolls: the top for a
 * move to another page (unless the move asked to keep it), the saved position on
 * back/forward, nothing for a move within the page (a query change, an anchor: the browser
 * scrolls to it). The browser restores nothing itself while the page is open (`manual`), and
 * again on a reload of the document (`auto` when it is left).
 */
function useScrollRestoration(key: string | null) {
  useEffect(() => {
    const manual = () => {
      window.history.scrollRestoration = 'manual';
    };
    const auto = () => {
      window.history.scrollRestoration = 'auto';
    };
    manual();
    window.addEventListener('pagehide', auto);
    window.addEventListener('pageshow', manual);

    const current = getStorefrontHistory()?.location;
    let currentKey = current?.state.key ?? null;
    let currentPage = current ? `${current.pathname}${current.search}` : null;
    const unsubscribe = subscribeStorefrontHistory(({ location, action }) => {
      if (currentKey) scrollPositions.set(currentKey, window.scrollY);
      const page = `${location.pathname}${location.search}`;
      const samePage = page === currentPage;
      currentKey = location.state.key ?? null;
      currentPage = page;

      if (samePage) pendingScroll = null;
      else if (action.type === 'PUSH' || action.type === 'REPLACE') {
        const keep = (location.state as { scroll?: boolean }).scroll === false;
        pendingScroll = keep ? null : 0;
      } else {
        pendingScroll = (currentKey ? scrollPositions.get(currentKey) : undefined) ?? 0;
      }
    });
    return () => {
      unsubscribe();
      window.removeEventListener('pagehide', auto);
      window.removeEventListener('pageshow', manual);
      auto();
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingScroll === null) return;
    const top = pendingScroll;
    pendingScroll = null;
    return scrollWhenReachable(top);
  }, [key]);
}

/**
 * The client side of a storefront page (see createRuntimePage): the page Next rendered on the
 * server (SSR) at its own address, and on the client every page the storefront history moves
 * to, rendered in its place without the Next router (CSR, `renderPage`). An address the client
 * cannot render (a module page such as the checkout, rendered only by the server, or no page
 * at all) loads from the server.
 */
export function RuntimeClientPage({ initial, renderPage }: RuntimeClientPageProps) {
  useClaimPageRendering();
  const location = useHistoryLocation();
  const page = usePage();
  const { stripLocale } = useLocalization();
  const initialPathname = stripLocale(
    new URL(useInitialLocation(), 'http://page.local').pathname
  );
  useScrollRestoration(location?.state.key ?? null);

  const isInitial = page.pathname === initialPathname;
  const rendersOnServer = !isInitial && isServerOnlyPage(page.pathname);

  useEffect(() => {
    if (rendersOnServer) loadCurrentAddress();
  }, [rendersOnServer]);

  if (isInitial) return <>{initial}</>;
  if (rendersOnServer) return null;
  return (
    <ClientPage
      key={page.pathname}
      href={`${page.pathname}${page.search}`}
      renderPage={renderPage}
    />
  );
}

/** One page, loaded once for the address it was opened at; query changes stay on it. */
function ClientPage({
  href,
  renderPage,
}: {
  href: string;
  renderPage: (href: string) => ReactNode;
}) {
  const [pageHref] = useState(href);
  return <>{renderPage(pageHref)}</>;
}
