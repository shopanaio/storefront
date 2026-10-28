'use client';

/**
 * Pages loaded programmatically on the client, the way `page.tsx` renders them on the
 * server: route → page definition → `loadData` → template → `Builder`. For apps that move
 * between pages without the framework router (a mobile stack): the first page still comes from
 * the server render, the following ones from here. `preload` stays on the server: a page is
 * ready once its data and template are, and its sections load their queries themselves,
 * rendering what the Apollo cache already has.
 *
 * Page definitions and templates are code-split; `preloadRuntimePages` loads them ahead of
 * time. With both loaded and a `loadData` that answers at once (it reads only the address),
 * a page renders in the same render that asks for it, without suspending.
 */
import type {
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { use, type ReactNode } from 'react';
import { Builder } from '@shopana/storefront-sdk/core/Builder';
import type { PageTemplate, PageType } from '@shopana/storefront-sdk/core/types';
import type {
  RuntimePageDataResult,
  RuntimePageModuleMap,
  RuntimePageServices,
  RuntimeRenderablePageType,
} from './page-definition';
import { loadRenderableDefinition } from './page-registry';
import { resolveRuntimeRoute } from './route';

export type RuntimePageContent =
  | { status: 'ready'; pageType: PageType; element: ReactNode }
  | { status: 'not-found' }
  /** Module pages (src/modules) render only on the server. */
  | { status: 'unsupported' };

interface LoadRuntimePageContentOptions {
  /** Path and search without the locale segment, e.g. `/products/socks?variant=2`. */
  href: string;
  pages: RuntimePageModuleMap;
  client: ApolloClient;
}

/**
 * A promise that carries its outcome the way React's `use` reads it: a settled one returns
 * its value in the same render instead of suspending.
 */
export type TrackedPromise<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
};

export function track<T>(promise: Promise<T>): TrackedPromise<T> {
  const tracked = promise as TrackedPromise<T>;
  tracked.status = 'pending';
  tracked.then(
    (value) => {
      tracked.status = 'fulfilled';
      tracked.value = value;
    },
    (reason: unknown) => {
      tracked.status = 'rejected';
      tracked.reason = reason;
    }
  );
  return tracked;
}

export function fulfilled<T>(value: T): TrackedPromise<T> {
  const promise = Promise.resolve(value) as TrackedPromise<T>;
  promise.status = 'fulfilled';
  promise.value = value;
  return promise;
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T> | null)?.then === 'function';
}

type Definition = Awaited<ReturnType<typeof loadRenderableDefinition>>;

export interface PageModules {
  definition: Definition;
  template: PageTemplate<unknown>;
}

/** Definition and template loads of each page type, per registry; a failed one is dropped. */
const moduleLoads = new WeakMap<
  RuntimePageModuleMap,
  Map<RuntimeRenderablePageType, TrackedPromise<PageModules>>
>();

export function loadPageModules(
  pages: RuntimePageModuleMap,
  pageType: RuntimeRenderablePageType
): TrackedPromise<PageModules> {
  let loads = moduleLoads.get(pages);
  if (!loads) {
    loads = new Map();
    moduleLoads.set(pages, loads);
  }

  let load = loads.get(pageType);
  if (!load) {
    const pageLoads = loads;
    load = track(
      loadRenderableDefinition(pages, pageType).then(async (definition) => ({
        definition,
        template: await definition.loadTemplate(),
      }))
    );
    load.catch(() => pageLoads.delete(pageType));
    loads.set(pageType, load);
  }
  return load;
}

/**
 * Loads the definitions and templates of the site pages, so later client page loads find
 * them ready. Call it once the app is idle after it starts; failures are left to the page
 * load that needs the module.
 */
export function preloadRuntimePages(pages: RuntimePageModuleMap): void {
  for (const pageType of Object.keys(pages) as PageType[]) {
    if (pageType === '404') continue;
    loadPageModules(pages, pageType).catch(() => {});
  }
}

/**
 * Query results land in the browser cache the page's hooks read from, so there is no
 * snapshot to hand over: the cache state stays empty and hydration merges nothing.
 */
export function createClientPageServices(client: ApolloClient): RuntimePageServices {
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

/** Search params as the record page definitions read (`searchParams` of their context). */
export function toSearchRecord(searchParams: URLSearchParams) {
  const record: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    record[key] = values.length > 1 ? values : values[0];
  }
  return record;
}

/** The page of `pageType` rendered with its data: the template through Builder, in its Provider. */
export function renderPageElement(
  pageType: RuntimeRenderablePageType,
  { definition, template }: PageModules,
  data: unknown
): ReactNode {
  const content = <Builder template={template} data={data} pageType={pageType} />;
  const Provider = definition.Provider;
  return Provider ? <Provider data={data}>{content}</Provider> : content;
}

function renderPage(
  pageType: RuntimeRenderablePageType,
  modules: PageModules,
  result: RuntimePageDataResult<unknown>
): RuntimePageContent {
  if (result.status === 'not-found') return { status: 'not-found' };
  return {
    status: 'ready',
    pageType,
    element: renderPageElement(pageType, modules, result.data),
  };
}

/**
 * Loads one page's data and template; no Apollo query waits. Settled at once when the page
 * modules are loaded and `loadData` answers without a promise.
 */
function loadRuntimePageContent({
  href,
  pages,
  client,
}: LoadRuntimePageContentOptions): TrackedPromise<RuntimePageContent> {
  const url = new URL(href, window.location.origin);
  const resolution = resolveRuntimeRoute(url.pathname);

  if (resolution.kind === 'module') return fulfilled({ status: 'unsupported' });

  const { pageType, params: routeParams } = resolution.route;
  if (pageType === '404') return fulfilled({ status: 'not-found' });

  const loadData = (definition: Definition) =>
    definition.loadData({
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

  const modules = loadPageModules(pages, pageType);
  if (modules.status === 'fulfilled' && modules.value) {
    const loaded = modules.value;
    const result = loadData(loaded.definition);
    if (!isPromise(result)) return fulfilled(renderPage(pageType, loaded, result));
    return track(result.then((data) => renderPage(pageType, loaded, data)));
  }

  return track(
    modules.then(async (loaded) =>
      renderPage(pageType, loaded, await loadData(loaded.definition))
    )
  );
}

/** Recently opened pages; a stack revisits them on back, so a few are kept. */
const MAX_CACHED_PAGES = 8;
const pageCache = new Map<string, TrackedPromise<RuntimePageContent>>();

/** The cached load of a page, started on first ask; a failed load is dropped to retry. */
function cachedPageContent(
  options: LoadRuntimePageContentOptions
): TrackedPromise<RuntimePageContent> {
  const { href } = options;
  let promise = pageCache.get(href);

  if (!promise) {
    promise = loadRuntimePageContent(options);
    promise.catch(() => pageCache.delete(href));
    pageCache.set(href, promise);
    if (pageCache.size > MAX_CACHED_PAGES) {
      pageCache.delete(pageCache.keys().next().value as string);
    }
  }

  return promise;
}

/**
 * The page at `href`, rendered at once when its modules are loaded (see
 * `preloadRuntimePages`) and its data needs no network; otherwise it suspends until they
 * are. Wrap the caller in Suspense (loading) and an error boundary (failed loads). A page
 * stays cached by `href`, so going back to it renders at once.
 */
export function useRuntimePageContent(
  href: string,
  pages: RuntimePageModuleMap
): RuntimePageContent {
  const client = useApolloClient();
  return use(cachedPageContent({ href, pages, client }));
}
