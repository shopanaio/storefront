'use client';

import { useEffect } from 'react';
import {
  getStorefrontHistory,
  subscribeStorefrontHistory,
} from '@shopana/storefront-sdk/routing';
import { resolveRuntimeRoute } from './route';

/**
 * Who renders the page a history move leads to. The Next router never does on the client:
 * the client side of a storefront page (RuntimeClientPage) or an app moving pages itself (the
 * mobile stack, a NavigationScope with `onNavigate`) claims it while mounted. A move nobody
 * renders (from a module page such as the checkout, rendered only by the server) loads the
 * page at its new address from the server.
 */
let claims = 0;

/** Claims the rendering of history moves while the caller is mounted. */
export function useClaimPageRendering(claim = true): void {
  useEffect(() => {
    if (!claim) return;
    claims += 1;
    return () => {
      claims -= 1;
    };
  }, [claim]);
}

/**
 * A page the client cannot render, so the server answers it: a module page (the checkout,
 * rendered only by the server) or no page at all (404). `pathname` is without the locale.
 */
export function isServerOnlyPage(pathname: string): boolean {
  const resolution = resolveRuntimeRoute(pathname);
  return resolution.kind === 'module' || resolution.route.pageType === '404';
}

/** Loads the document at the address the history shows now. */
export function loadCurrentAddress(): void {
  getStorefrontHistory()?.flush();
  window.location.reload();
}

/**
 * Loads the page of a move nothing on the page renders; a move within the page (an anchor, the
 * same path and query) stays. Mounted once, by StorefrontHistory, which also creates the
 * storefront history here, not while rendering.
 */
export function UnclaimedMoves() {
  useEffect(() => {
    const pageOf = (location: { pathname: string; search: string }) =>
      `${location.pathname}${location.search}`;
    let page = pageOf(window.location);
    return subscribeStorefrontHistory(({ location, fromOutside }) => {
      const previous = page;
      page = pageOf(location);
      if (fromOutside || claims > 0 || page === previous) return;
      loadCurrentAddress();
    });
  }, []);
  return null;
}
