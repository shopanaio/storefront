'use client';

/**
 * The router's history for an app that keeps its own screens over it (a mobile stack): the
 * app decides which screen a move opens and writes the move as a router navigation with its
 * own state; the router loads the page of the entry in the browser (see the page route's
 * client loader), and the app shows it in that screen. Back and forward are router moves the
 * app follows by the location.
 */
import { useContext, useEffect, useMemo, useRef } from 'react';
import {
  UNSAFE_DataRouterContext as DataRouterContext,
  useLocation,
  useMatches,
  useNavigate,
} from 'react-router';
import type { RuntimePageData } from './route-data';

export interface AppHistoryLocation {
  /** Unique per history entry, kept by the entry across reloads. */
  key: string;
  pathname: string;
  search: string;
  /** What the app passed with the move that made the entry. */
  state: unknown;
}

export interface AppHistoryNavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export interface AppHistory {
  location: AppHistoryLocation;
  /** A router navigation to `href` (already localized), with `state` on its entry. */
  navigate(href: string, options?: AppHistoryNavigateOptions): void;
  /** Moves by `delta` entries, as browser back and forward do. */
  go(delta: number): void;
}

export function useAppHistory(): AppHistory {
  const routerNavigate = useNavigate();
  const { key, pathname, search, state } = useLocation();

  return useMemo(
    () => ({
      location: { key, pathname, search, state },
      navigate: (href, { replace, state: entryState } = {}) =>
        void routerNavigate(href, {
          replace,
          state: entryState,
          // Screens scroll in their own containers.
          preventScrollReset: true,
        }),
      go: (delta) => void routerNavigate(delta),
    }),
    [key, pathname, search, state, routerNavigate]
  );
}

/**
 * Calls `listener` with the entry each move of the router goes to, as the move starts: before
 * the router loads the page of the entry and renders it, so the app follows a back or a
 * forward at once (pops its screen). Once per entry; the listener may change between renders.
 */
export function useAppHistoryMoves(
  listener: (location: AppHistoryLocation) => void
): void {
  const router = useContext(DataRouterContext)?.router;
  const latest = useRef(listener);
  useEffect(() => {
    latest.current = listener;
  });

  useEffect(() => {
    if (!router) return;
    let lastKey = router.state.location.key;
    return router.subscribe((state) => {
      const {
        key,
        pathname,
        search,
        state: entryState,
      } = state.navigation.location ?? state.location;
      if (key === lastKey) return;
      lastKey = key;
      latest.current({ key, pathname, search, state: entryState });
    });
  }, [router]);
}

export interface RouterPage {
  /** The history entry the router shows. */
  key: string;
  state: unknown;
  /** What its page route loaded; null when it failed. */
  page: RuntimePageData | null;
  /** Why its page route failed, when it did. */
  error: unknown;
}

function isRuntimePageData(value: unknown): value is RuntimePageData {
  const kind = (value as { kind?: unknown } | null)?.kind;
  return kind === 'page' || kind === 'module' || kind === 'not-found';
}

/**
 * The page the router loaded for the entry it shows, once the move is done: the server's
 * for the first one, the browser's after it. Null outside the storefront's page routes.
 */
export function useRouterPage(): RouterPage | null {
  const router = useContext(DataRouterContext)?.router;
  const location = useLocation();
  const match = useMatches().at(-1);
  if (!match) return null;
  const error = router?.state.errors?.[match.id];
  if (error === undefined && !isRuntimePageData(match.loaderData)) return null;
  return {
    key: location.key,
    state: location.state,
    page: error === undefined ? (match.loaderData as RuntimePageData) : null,
    error,
  };
}
