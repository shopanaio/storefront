'use client';

/**
 * Pages loaded programmatically on the client, the way `page.tsx` renders them on the
 * server: route → page definition → `loadData` → template → `Builder`. For apps that move
 * between pages without the Next router (a mobile stack): the first page still comes from
 * the server render, the following ones from here.
 */
import type {
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { use, type ReactNode } from 'react';
import { Builder } from '@shopana/storefront-sdk/core/Builder';
import type { PageType } from '@shopana/storefront-sdk/core/types';
import type {
  RuntimePageModuleMap,
  RuntimePageServices,
} from './page-definition';
import { loadRenderableDefinition } from './page-registry';
import { resolveRuntimeRoute } from './route';

export type RuntimePageContent =
  | { status: 'ready'; pageType: PageType; element: ReactNode }
  | { status: 'not-found' }
  /** Module pages (src/modules) render only on the server. */
  | { status: 'unsupported' };

export interface LoadRuntimePageContentOptions {
  /** Path and search without the locale segment, e.g. `/products/socks?variant=2`. */
  href: string;
  pages: RuntimePageModuleMap;
  client: ApolloClient;
}

/**
 * Query results land in the browser cache the page's hooks read from, so there is no
 * snapshot to hand over: the cache state stays empty and hydration merges nothing.
 */
function createClientPageServices(client: ApolloClient): RuntimePageServices {
  return {
    async loadQuery(document, variables) {
      const result = await client.query({ query: document, variables });
      return {
        data: result.data as never,
        variables,
        cacheState: {} as NormalizedCacheObject,
      };
    },
    async extractCacheState() {
      return {} as NormalizedCacheObject;
    },
  };
}

function toSearchRecord(searchParams: URLSearchParams) {
  const record: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    record[key] = values.length > 1 ? values : values[0];
  }
  return record;
}

/** Loads one page's data and template and returns it ready to render. */
export async function loadRuntimePageContent({
  href,
  pages,
  client,
}: LoadRuntimePageContentOptions): Promise<RuntimePageContent> {
  const url = new URL(href, window.location.origin);
  const resolution = resolveRuntimeRoute(url.pathname);

  if (resolution.kind === 'module') return { status: 'unsupported' };

  const { pageType, params: routeParams } = resolution.route;
  if (pageType === '404') return { status: 'not-found' };

  const definition = await loadRenderableDefinition(pages, pageType);
  const result = await definition.loadData({
    pageType,
    request: {
      url: url.href,
      pathname: url.pathname,
      search: url.search,
      host: url.host,
      searchParams: url.searchParams,
    },
    routeParams,
    searchParams: toSearchRecord(url.searchParams),
    services: createClientPageServices(client),
  });

  if (result.status === 'not-found') return { status: 'not-found' };

  const template = await definition.loadTemplate();
  const content = (
    <Builder template={template} data={result.data} pageType={pageType} />
  );
  const Provider = definition.Provider;

  return {
    status: 'ready',
    pageType,
    element: Provider ? (
      <Provider data={result.data}>{content}</Provider>
    ) : (
      content
    ),
  };
}

/** Recently opened pages; a stack revisits them on back, so a few are kept. */
const MAX_CACHED_PAGES = 8;
const pageCache = new Map<string, Promise<RuntimePageContent>>();

/**
 * Suspends until the page at `href` is loaded, then returns it. Wrap the caller in
 * Suspense (loading) and an error boundary (failed queries). A page stays cached by
 * `href`, so going back to it renders at once.
 */
export function useRuntimePageContent(
  href: string,
  pages: RuntimePageModuleMap
): RuntimePageContent {
  const client = useApolloClient();
  let promise = pageCache.get(href);

  if (!promise) {
    promise = loadRuntimePageContent({ href, pages, client });
    promise.catch(() => pageCache.delete(href));
    pageCache.set(href, promise);
    if (pageCache.size > MAX_CACHED_PAGES) {
      pageCache.delete(pageCache.keys().next().value as string);
    }
  }

  return use(promise);
}
