import type { RuntimeRenderablePageType } from '../core/page-definition';

/**
 * The browser hydrates once the code the server's page rendered with is here. React leaves a
 * Suspense boundary that waits for a chunk or a promise unhydrated, and an update reaching
 * it meanwhile (a context the router changes as it starts) makes React drop the server's HTML
 * there and render it anew: its skeletons first, then its queries sent again. Code loaded
 * first, hydration finds every boundary ready.
 */
const waits: Promise<unknown>[] = [];

/**
 * Hydration waits for `load`. Called while the app's modules evaluate (route modules come
 * before the client entry), for code a lazy part of the page needs: an app the server
 * rendered for this device. A failed load is the render's to meet (its boundary).
 */
export function waitBeforeHydration(load: Promise<unknown>): void {
  waits.push(load.catch(() => {}));
}

/** Settles once everything hydration waits for is loaded or failed. */
export async function hydrationReady(): Promise<void> {
  await Promise.all(waits);
}

/** What the server rendered at the page route: enough to load the page's code. */
export type HydratedPage =
  | { kind: 'page'; pageType: RuntimeRenderablePageType }
  | { kind: 'module'; pathname: string }
  | { kind: 'not-found' };

const GLOBAL_KEY = '__shopanaHydratedPage';

type PageGlobal = { [GLOBAL_KEY]?: HydratedPage };

/** The page of the route data the server rendered with; null without one (an error page). */
export function hydratedPageOf(
  loaderData: Record<string, unknown> | null | undefined,
  errors: Record<string, unknown> | null | undefined
): HydratedPage | null {
  for (const data of Object.values(loaderData ?? {})) {
    const page = data as Partial<Record<string, unknown>> | null;
    if (page?.kind === 'page' && typeof page.pageType === 'string') {
      return {
        kind: 'page',
        pageType: page.pageType as RuntimeRenderablePageType,
      };
    }
    if (page?.kind === 'module' && typeof page.pathname === 'string') {
      return { kind: 'module', pathname: page.pathname };
    }
    if (page?.kind === 'not-found') return { kind: 'not-found' };
  }
  // A page its loader found missing renders the 404 page in the route's boundary.
  const notFound = Object.values(errors ?? {}).some(
    (error) => (error as { status?: unknown } | null)?.status === 404
  );
  return notFound ? { kind: 'not-found' } : null;
}

/** Inline script with the server's page; empty without one. */
export function hydratedPageScript(page: HydratedPage | null): string {
  if (!page) return '';
  const json = JSON.stringify(page).replace(/</g, '\\u003c');
  return `<script>window.${GLOBAL_KEY}=${json}</script>`;
}

/** The page the document carried (its inline scripts ran before the app's modules). */
export function readHydratedPage(): HydratedPage | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as PageGlobal)[GLOBAL_KEY] ?? null;
}
