'use client';

/**
 * The page routes of a storefront under React Router (the home page and `*`): render what
 * their loader resolved, a reserved page through Builder, a module page or the theme's 404
 * page, under the layout route that renders the layout of the page type. The layout stays
 * mounted from page to page; the page under it is new for every address, with the cache
 * snapshot of its `preload` applied first.
 *
 * After hydration the app runs as a single-page app: a client navigation asks the server
 * nothing. Its loader resolves the address in the browser, loads the page's modules and runs
 * `loadData` with the app's Apollo client; `preload` stays on the server, the sections load
 * their queries under their skeletons. The metadata follows once known.
 *
 * A page a section finds missing while rendering (`notFound()`, `PageNotFound`) renders the 404
 * page in the page's boundary, under the layout of the page, the same on the server (status
 * 404) and in the browser. A 404 the loader answers renders in the 404 layout.
 */
import {
  createContext,
  createElement,
  Fragment,
  memo,
  Suspense,
  use,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import type { ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useRouteError,
  type ClientLoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { Builder } from '@shopana/storefront-sdk/core/Builder';
import { useDataGateOpen } from '@shopana/storefront-sdk/core/DataBoundary';
import { useHydrated } from '@shopana/storefront-sdk/core/Hydrated';
import {
  provideStaticResults,
  readStaticDocument,
  type StaticState,
} from '@shopana/storefront-sdk/static';
import { buildClosedPageRedirect } from '@shopana/storefront-sdk/modules/session/core/closedPageRedirect';
import { ClosedPageGuard } from '@shopana/storefront-sdk/modules/session/react/components/ClosedPageGuard';
import { splitLocaleFromPathname } from '@shopana/storefront-sdk/routing';
import { getServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';
import {
  createClientPageServices,
  loadPageModules,
  renderPageElement,
  toSearchRecord,
  track,
  type TrackedPromise,
} from '../core/page-client';
import {
  buildModuleMetadata,
  getModuleMetadataGenerator,
} from '../core/module-page';
import type { RuntimeMetadata } from '../core/metadata';
import {
  addressSite,
  createSiteContext,
  type RuntimeSite,
  type RuntimeTitleTemplate,
} from '../core/site';
import type {
  RuntimePageDataResult,
  RuntimePageModuleMap,
  RuntimePageServices,
  RuntimeRenderablePageType,
} from '../core/page-definition';
import type { SDKRequestContext } from '../core/request-context';
import { resolveRuntimeRoute } from '../core/route';
import {
  getBrowserApolloClient,
  getClientSite,
  getDefaultLocaleSegment,
  getKnownLocaleSegments,
  useLocaleSegments,
  useRuntimeAppDefinition,
  useRuntimeRoot,
} from './document';
import { RouteErrorPage, type RuntimeErrorPage } from './error';
import {
  applyDocumentMetadata,
  mergeMetaDescriptors,
  pageSiteMetadata,
  toMetaDescriptors,
} from './metadata';
import { isNotFoundSignal } from './not-found-response';
import { readRenderStatus, recordRenderStatus } from './render-status';
import {
  loadModuleLayout,
  loadModulePage,
  loadNotFoundModules,
  loadRouteLayout,
  type PageLayoutComponent,
  type RuntimePageRouteDefinition,
  type RuntimeShellSkeletonProps,
} from './page-modules';
import type { RuntimePageData, RuntimeRootData } from './route-data';
import type { HydratedPage } from './hydration';
import { staticDataUrl } from '../static/keys';

export type {
  LoadRuntimeLayout,
  PageLayoutComponent,
  RuntimePageRouteDefinition,
  RuntimeShellSkeletonProps,
} from './page-modules';

export interface CreateRuntimeLayoutRouteOptions extends RuntimePageRouteDefinition {
  ErrorPage: RuntimeErrorPage;
}

export interface CreateRuntimePageRouteOptions extends CreateRuntimeLayoutRouteOptions {
  /** The app's title template (`RuntimeAppDefinition.titleTemplate`). */
  titleTemplate?: RuntimeTitleTemplate;
}

function moduleRecord(pathname: string) {
  const resolution = resolveRuntimeRoute(pathname);
  if (resolution.kind !== 'module') {
    throw new Error(`No module page is registered for "${pathname}"`);
  }
  return resolution.match.record;
}

/**
 * A page found missing while rendering: the 404 response of `notFound()` and `PageNotFound`
 * (an error response once the server render or hydration carried it), or a PageNotFoundError
 * thrown by other code, which the server hides in production: the server entry keeps its 404
 * for the render that shows the error.
 */
function isNotFoundError(error: unknown): boolean {
  return (
    isNotFoundSignal(error) ||
    (isRouteErrorResponse(error) && error.status === 404) ||
    (typeof window === 'undefined' && readRenderStatus() === 404)
  );
}

/** The layout of a page: its type's, a module's own, the 404 page's. */
function loadPageLayout(
  route: RuntimePageRouteDefinition,
  page: HydratedPage
): TrackedPromise<PageLayoutComponent | null> {
  if (page.kind === 'page') {
    return loadRouteLayout(route, page.pageType, { isModule: false });
  }
  if (page.kind === 'module') {
    return loadModuleLayout(route, moduleRecord(page.pathname));
  }
  if (page.kind === 'shell') return loadAddressLayout(route, page.pathname, []);
  return loadRouteLayout(route, '404', { isModule: false });
}

/** The modules of a page: its type's page and template, a module's page, the 404 page's. */
function loadPageModulesOf(
  pages: RuntimePageModuleMap,
  page: HydratedPage
): TrackedPromise<unknown> {
  if (page.kind === 'page') return loadPageModules(pages, page.pageType);
  if (page.kind === 'module')
    return loadModulePage(moduleRecord(page.pathname));
  // A shell renders its skeleton: the page's code loads with the page.
  if (page.kind === 'shell') return track(Promise.resolve());
  return loadNotFoundModules(pages);
}

/**
 * The code the server's page rendered with, loaded before hydration (see `hydration`): the
 * page's modules and its layout, so the render reads them at once.
 */
export async function preloadHydratedPage(
  route: RuntimePageRouteDefinition,
  page: HydratedPage
): Promise<void> {
  await Promise.all([
    loadPageModulesOf(route.pages, page),
    loadPageLayout(route, page),
  ]);
}

/**
 * The layout of an address whose page has no data (its loader failed): of the page type the
 * address resolves to, so the error page keeps the layout of the page, as under Next.js.
 */
function loadAddressLayout(
  route: RuntimePageRouteDefinition,
  pathname: string,
  localeSegments: readonly string[]
): TrackedPromise<PageLayoutComponent | null> {
  const resolution = resolveRuntimeRoute(
    splitLocaleFromPathname(pathname, localeSegments).pathname
  );
  if (resolution.kind === 'module') {
    return loadModuleLayout(route, resolution.match.record);
  }
  return loadRouteLayout(route, resolution.pageType, { isModule: false });
}

/** The page itself, from loaded modules, then `end` (see `RuntimePageProps`). */
function usePageElement(
  pages: RuntimePageModuleMap,
  page: RuntimePageData,
  end?: ReactNode
): ReactNode {
  const client = useApolloClient();
  const services = useMemo(() => createClientPageServices(client), [client]);

  if (page.kind === 'page') {
    const modules = use(loadPageModules(pages, page.pageType));
    return renderPageElement(page.pageType, modules, page.data, end);
  }

  if (page.kind === 'shell') return <ShellPage pages={pages} end={end} />;

  if (page.kind === 'module') {
    const { Component } = use(loadModulePage(moduleRecord(page.pathname)));
    const element = (
      <>
        <Component {...page.props} services={services} />
        {end}
      </>
    );
    return page.closedPageRedirect ? (
      <ClosedPageGuard redirectTo={page.closedPageRedirect}>
        {element}
      </ClosedPageGuard>
    ) : (
      element
    );
  }

  const { definition, template } = use(loadNotFoundModules(pages));
  const content = (
    <Builder template={template} data={page.data} pageType="404" end={end} />
  );
  const Provider = definition.Provider;
  return (
    <>
      {/* A missing page stays out of search results, whatever status reached the crawler. */}
      <meta name="robots" content="noindex" />
      {Provider ? <Provider data={page.data}>{content}</Provider> : content}
    </>
  );
}

/**
 * The request a 404 page loads its data for, at the real address: the browser's, or on the
 * server the request's.
 */
function requestOfAddress(href: string): SDKRequestContext {
  const scope =
    typeof window === 'undefined' ? getServerRequestScope() : undefined;
  const origin = scope ? scope.url.origin : window.location.origin;
  const host = scope
    ? (scope.headers.get('host') ?? scope.url.host)
    : window.location.host;
  const url = new URL(href, origin);
  return {
    url: url.href,
    pathname: url.pathname,
    search: url.search,
    host,
    searchParams: url.searchParams,
  };
}

/**
 * The 404 data loads of the not-found page a section ran into, by the Apollo client that loads
 * them: on the server the client of one request (its data is that visitor's, and it goes with
 * the request), in the browser the app's client. A few addresses are kept per client.
 */
const notFoundDataLoads = new WeakMap<
  ApolloClient,
  Map<string, TrackedPromise<unknown>>
>();
const MAX_NOT_FOUND_LOADS = 8;

function useNotFoundData(route: RuntimePageRouteDefinition): unknown {
  const client = useApolloClient();
  const location = useLocation();
  const href = `${location.pathname}${location.search}`;
  let loads = notFoundDataLoads.get(client);
  if (!loads) {
    loads = new Map();
    notFoundDataLoads.set(client, loads);
  }
  let load = loads.get(href);
  if (!load) {
    const request = requestOfAddress(href);
    load = track(
      loadNotFoundModules(route.pages).then(({ definition }) =>
        definition.loadData({
          pageType: '404',
          request,
          services: createClientPageServices(client),
        })
      )
    );
    const clientLoads = loads;
    load.catch(() => clientLoads.delete(href));
    loads.set(href, load);
    if (loads.size > MAX_NOT_FOUND_LOADS) {
      loads.delete(loads.keys().next().value as string);
    }
  }
  return use(load);
}

/** The 404 page of a page a section found missing while rendering. */
function RenderedNotFound({ route }: { route: RuntimePageRouteDefinition }) {
  // The server entry answers 404 when this renders before the response.
  recordRenderStatus(404);
  const data = useNotFoundData(route);
  return usePageElement(route.pages, {
    kind: 'not-found',
    data,
    metadata: {},
  });
}

/** The theme's skeleton of a shell, set by the layout route around the pages. */
const ShellSkeletonContext =
  createContext<ComponentType<RuntimeShellSkeletonProps> | null>(null);

/**
 * The pages a shell resolved in the browser, per client and address: a screen rendered again
 * (StrictMode, a router update) finds its page here instead of loading it twice.
 */
const shellPageLoads = new WeakMap<
  ApolloClient,
  Map<string, TrackedPromise<RuntimePageData>>
>();

function loadShellPage(
  pages: RuntimePageModuleMap,
  client: ApolloClient,
  href: string
): TrackedPromise<RuntimePageData> {
  let loads = shellPageLoads.get(client);
  if (!loads) {
    loads = new Map();
    shellPageLoads.set(client, loads);
  }
  let load = loads.get(href);
  if (!load) {
    // A shell's own address has no static data: the builder rendered no page there.
    load = track(
      loadBrowserPage(pages, new URL(href, window.location.origin), client, {
        staticData: false,
      })
    );
    const clientLoads = loads;
    load.catch(() => clientLoads.delete(href));
    loads.set(href, load);
  }
  return load;
}

/** The page of a shell's address, loaded by the browser as on a client navigation. */
function ResolvedShell({
  pages,
  href,
  end,
}: {
  pages: RuntimePageModuleMap;
  href: string;
  end?: ReactNode;
}) {
  const client = useApolloClient();
  const page = use(loadShellPage(pages, client, href));
  return <RuntimePage pages={pages} page={page} end={end} />;
}

/**
 * A client page of the static site (`kind: 'shell'`): the theme's skeleton while the document
 * hydrates (the HTML has it), then the page of the address, which the browser loads itself:
 * its modules, its `loadData`, its metadata. A closed page's guard takes a guest away.
 */
function ShellPage({
  pages,
  end,
}: {
  pages: RuntimePageModuleMap;
  end?: ReactNode;
}) {
  const hydrated = useHydrated();
  const Skeleton = useContext(ShellSkeletonContext);
  const location = useLocation();
  const localeSegments = useLocaleSegments();
  const resolution = resolveRuntimeRoute(
    splitLocaleFromPathname(location.pathname, localeSegments).pathname
  );
  const skeleton = (
    <>
      {Skeleton
        ? createElement(Skeleton, {
            pageType: resolution.pageType,
            pathname: resolution.pathname,
          })
        : null}
      {end}
    </>
  );
  if (!hydrated) return skeleton;
  return (
    <Suspense fallback={skeleton}>
      <ResolvedShell
        pages={pages}
        href={`${location.pathname}${location.search}`}
        end={end}
      />
    </Suspense>
  );
}

/** The request of an address the browser loads a page for itself. */
function requestOfUrl(url: URL): SDKRequestContext {
  return {
    url: url.href,
    pathname: url.pathname,
    search: url.search,
    host: url.host,
    searchParams: url.searchParams,
  };
}

/**
 * Metadata computed on first ask, once: the queries it may need (a listing's title) go out
 * only when the page shows, not while a navigation resolves it. A failure leaves the route's
 * tags (a section shows the page's own error).
 */
function laterMetadata(
  generate: () => Promise<RuntimeMetadata> | RuntimeMetadata
): () => Promise<RuntimeMetadata> {
  let pending: Promise<RuntimeMetadata> | null = null;
  return () => {
    if (!pending) {
      pending = Promise.resolve().then(generate);
      pending.catch(() => {});
    }
    return pending;
  };
}

/**
 * Puts the metadata of a page the browser loaded into the document while the page shows. It
 * is computed once the page's DataGate is open (at once without one): its queries are those
 * the page's sections send, and go out with them, never while a screen animates in.
 */
function PendingMetadata({ load }: { load: () => Promise<RuntimeMetadata> }) {
  const open = useDataGateOpen();
  const root = useRuntimeRoot();
  const titleTemplate = useRuntimeAppDefinition()?.titleTemplate;
  // The address the page showed at: a screen of a stack under a later address keeps its own.
  const location = useLocation();
  const [pathname] = useState(location.pathname);
  useEffect(() => {
    if (!open) return;
    let active = true;
    let restore: (() => void) | null = null;
    load().then(
      (metadata) => {
        if (!active) return;
        restore = applyDocumentMetadata(
          pageSiteMetadata(metadata, root, pathname, titleTemplate) ?? {}
        );
      },
      () => {}
    );
    return () => {
      active = false;
      restore?.();
    };
  }, [load, open, root, pathname, titleTemplate]);
  return null;
}

export interface RuntimePageProps {
  pages: RuntimePageModuleMap;
  /** What the page route loaded for an address (see `useRouterPage`). */
  page: RuntimePageData;
  /**
   * What ends the page after its content (the site's footer): part of the page, so a page
   * with a template skeleton shows it with the loaded page, not under the skeleton. Kept
   * stable (an element made once): a new one renders the memoized page again.
   */
  end?: ReactNode;
}

/**
 * A page from the data the page route loaded for it, without the route: for an app that keeps
 * its own screens over the router's history (a mobile stack), each screen showing the page of
 * its entry while the router has moved on. The metadata of a page the browser loaded follows
 * as on the route; a missing page or an error goes to the boundary around. Memoized: a screen
 * rendered again with the same page (a router update elsewhere) leaves the page as it is.
 */
export const RuntimePage = memo(function RuntimePage({
  pages,
  page,
  end,
}: RuntimePageProps) {
  return (
    <>
      {usePageElement(pages, page, end)}
      {page.pendingMetadata ? (
        <PendingMetadata load={page.pendingMetadata} />
      ) : null}
    </>
  );
});

/** An address the browser resolves a page for, as the server loader reads it. */
interface ClientAddress {
  url: URL;
  /** The URL locale segment, the default locale's for an unprefixed address. */
  localeSegment: string;
  resolution: ReturnType<typeof resolveRuntimeRoute>;
  request: SDKRequestContext;
  searchParams: ReturnType<typeof toSearchRecord>;
}

function clientAddress(url: URL): ClientAddress {
  const { locale: segment } = splitLocaleFromPathname(
    url.pathname,
    getKnownLocaleSegments()
  );
  return {
    url,
    localeSegment: segment ?? getDefaultLocaleSegment(),
    resolution: resolveRuntimeRoute(url.pathname, segment ?? undefined),
    request: requestOfUrl(url),
    searchParams: toSearchRecord(url.searchParams),
  };
}

type ModuleResolution = Extract<
  ClientAddress['resolution'],
  { kind: 'module' }
>;
type RenderableDefinition = Awaited<
  ReturnType<typeof loadPageModules>
>['definition'];

/**
 * The site of a page the browser loads: the browser's origin and the address's language.
 * Before the root data is known (a navigation during hydration) the address alone.
 */
function clientSite({ url, localeSegment }: ClientAddress): RuntimeSite {
  return getClientSite(localeSegment) ?? addressSite(url, localeSegment);
}

function pageContext(
  address: ClientAddress,
  pageType: RuntimeRenderablePageType,
  services: RuntimePageServices
) {
  const { request, searchParams, resolution } = address;
  const routeParams =
    resolution.kind === 'sdk' ? { ...resolution.route.params } : {};
  return {
    pageType,
    request,
    routeParams,
    searchParams,
    services,
    site: createSiteContext(clientSite(address)),
  };
}

/**
 * A module page the browser resolved; a page closed to visitors without a session is left to
 * its browser guard.
 */
function modulePageData(
  { url, localeSegment, searchParams }: ClientAddress,
  { match, pathname }: ModuleResolution,
  payload: unknown,
  services: RuntimePageServices
): RuntimePageData {
  const props = {
    params: {
      locale: localeSegment,
      module: pathname.split('/').filter(Boolean),
    },
    searchParams,
    pathParams: match.params ? { ...match.params } : {},
  };
  const generate = getModuleMetadataGenerator(payload);
  return {
    kind: 'module',
    slug: match.record.slug,
    pathname,
    props,
    closedPageRedirect: match.requiresSession
      ? buildClosedPageRedirect({
          pathname: url.pathname,
          search: url.search,
          locale: localeSegment,
        })
      : null,
    metadata: generate ? {} : buildModuleMetadata(match.record.slug),
    pendingMetadata: generate
      ? laterMetadata(() => generate({ ...props, services }))
      : null,
  };
}

/** A reserved page the browser loaded the data of; its metadata follows. */
function readyPageData(
  pageType: RuntimeRenderablePageType,
  definition: RenderableDefinition,
  context: ReturnType<typeof pageContext>,
  data: unknown
): RuntimePageData {
  const { generateMetadata } = definition;
  return {
    kind: 'page',
    pageType,
    data,
    metadata: {},
    pendingMetadata: generateMetadata
      ? laterMetadata(() => generateMetadata(context, data))
      : null,
  };
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T> | null)?.then === 'function';
}

type PageDataResult = RuntimePageDataResult<unknown>;

/**
 * `loadData` calls a screen started (`resolveRuntimePageNow`) that did not answer at once,
 * per client and address, while they are pending: the client loader of the navigation that
 * opened the screen takes the call over instead of making it again, and a screen rendered
 * again (StrictMode) finds it here. A settled call is dropped: a later client loader of the
 * address loads its data anew, never an answer from an earlier visit. A few are kept.
 */
const startedDataLoads = new WeakMap<
  ApolloClient,
  Map<string, Promise<PageDataResult>>
>();
const MAX_STARTED_DATA_LOADS = 8;

function addressKey(url: URL): string {
  return `${url.pathname}${url.search}`;
}

function startedDataLoad(
  client: ApolloClient,
  url: URL
): Promise<PageDataResult> | undefined {
  return startedDataLoads.get(client)?.get(addressKey(url));
}

function keepStartedDataLoad(
  client: ApolloClient,
  url: URL,
  load: Promise<PageDataResult>
): void {
  let loads = startedDataLoads.get(client);
  if (!loads) {
    loads = new Map();
    startedDataLoads.set(client, loads);
  }
  const key = addressKey(url);
  const clientLoads = loads;
  const drop = () => {
    if (clientLoads.get(key) === load) clientLoads.delete(key);
  };
  load.then(drop, drop);
  loads.set(key, load);
  if (loads.size > MAX_STARTED_DATA_LOADS) {
    loads.delete(loads.keys().next().value as string);
  }
}

/** The started `loadData` call of an address, handed to its client loader once. */
function takeStartedDataLoad(
  client: ApolloClient,
  url: URL
): Promise<PageDataResult> | undefined {
  const load = startedDataLoad(client, url);
  if (load) startedDataLoads.get(client)?.delete(addressKey(url));
  return load;
}

/**
 * The page of an address at once, when nothing has to be waited for: its modules are loaded
 * (`preloadRuntimePages`) and its `loadData` answers without a promise (it reads the address).
 * Null otherwise: a missing page, modules still loading, data that needs the network. The
 * page route's client loader resolves the same page for the router.
 */
export function resolveRuntimePageNow(
  pages: RuntimePageModuleMap,
  url: URL,
  client: ApolloClient
): RuntimePageData | null {
  const address = clientAddress(url);
  const { resolution } = address;
  const services = createClientPageServices(client);

  if (resolution.kind === 'module') {
    const modules = loadModulePage(resolution.match.record);
    if (modules.status !== 'fulfilled' || !modules.value) return null;
    return modulePageData(address, resolution, modules.value.payload, services);
  }

  const { pageType } = resolution.route;
  if (pageType === '404') return null;
  const modules = loadPageModules(pages, pageType);
  if (modules.status !== 'fulfilled' || !modules.value) return null;
  const { definition } = modules.value;
  // A call started for this address already (the screen rendered again) is still pending.
  if (startedDataLoad(client, url)) return null;
  const context = pageContext(address, pageType, services);
  const loaded = definition.loadData(context);
  if (isPromise(loaded)) {
    // Not lost: the client loader of the address takes it over.
    keepStartedDataLoad(client, url, loaded);
    return null;
  }
  if (loaded.status === 'not-found') return null;
  return readyPageData(pageType, definition, context, loaded.data);
}

/**
 * `resolveRuntimePageNow` for an app's own screen, made once: the page of `href` (a localized
 * path) in the screen's first render when nothing has to be waited for, null otherwise.
 * Nothing is resolved when `enabled` is false: a screen whose page comes from elsewhere (the
 * server render of the first one).
 */
export function useRuntimePageNow(
  pages: RuntimePageModuleMap,
  href: string,
  enabled = true
): RuntimePageData | null {
  const client = useApolloClient();
  const [page] = useState(() =>
    !enabled || typeof window === 'undefined'
      ? null
      : resolveRuntimePageNow(
          pages,
          new URL(href, window.location.origin),
          client
        )
  );
  return page;
}

/** The theme's 404 page, with its data loaded in the browser. */
async function browserNotFound(
  pages: RuntimePageModuleMap,
  request: SDKRequestContext,
  services: RuntimePageServices,
  route?: RuntimePageRouteDefinition
): Promise<RuntimePageData> {
  const [modules] = await Promise.all([
    loadNotFoundModules(pages),
    route ? loadRouteLayout(route, '404', { isModule: false }) : null,
  ]);
  const data = await modules.definition.loadData({
    pageType: '404',
    request,
    services,
  });
  return { kind: 'not-found', data, metadata: {} };
}

/** How long the static data of an address may take before its queries ask the API. */
const STATIC_DATA_TIMEOUT_MS = 10_000;

/**
 * Addresses whose static data this page load used already: a page visited again reads its
 * cache or the API, never an older snapshot over newer answers.
 */
const usedStaticData = new WeakMap<ApolloClient, Set<string>>();

/**
 * The static site's data of an address (`/__static/data/*.json`, the Apollo state the builder
 * rendered its page with) as the source of the answers of its queries (`provideStaticResults`).
 * Started, never waited for: the page renders at once, as from the API, its sections under
 * their skeletons, and their queries take their answers from the data when it comes. Only in
 * a static document; an address with no file (404) or a failed fetch is answered by the API.
 */
function startStaticPageData(client: ApolloClient, url: URL): void {
  if (!readStaticDocument()) return;
  const dataUrl = staticDataUrl(url.pathname);
  if (!dataUrl) return;
  let used = usedStaticData.get(client);
  if (!used) {
    used = new Set();
    usedStaticData.set(client, used);
  }
  if (used.has(dataUrl)) return;
  used.add(dataUrl);
  provideStaticResults(
    fetch(dataUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(STATIC_DATA_TIMEOUT_MS),
    }).then((response) =>
      response.ok ? (response.json() as Promise<StaticState>) : null
    )
  );
}

/**
 * The page of an address the browser loads itself (a client navigation, a shell of the static
 * site): its modules (and its layout, with the route) loaded, its `loadData` run with the
 * app's Apollo client, as the server loader resolves it; in a static document its queries
 * are answered from the static data of the address. A page closed to visitors without a
 * session is left to its browser guard.
 */
async function loadBrowserPage(
  pages: RuntimePageModuleMap,
  url: URL,
  client: ApolloClient,
  {
    route,
    staticData = true,
  }: { route?: RuntimePageRouteDefinition; staticData?: boolean } = {}
): Promise<RuntimePageData> {
  const address = clientAddress(url);
  const { resolution, request } = address;
  const services = createClientPageServices(client);

  if (resolution.kind === 'module') {
    const [{ payload }] = await Promise.all([
      loadModulePage(resolution.match.record),
      route ? loadModuleLayout(route, resolution.match.record) : null,
    ]);
    return modulePageData(address, resolution, payload, services);
  }

  const { pageType } = resolution.route;
  if (pageType === '404') {
    return browserNotFound(pages, request, services, route);
  }

  if (staticData) startStaticPageData(client, url);
  const [{ definition }] = await Promise.all([
    loadPageModules(pages, pageType),
    route ? loadRouteLayout(route, pageType, { isModule: false }) : null,
  ]);
  const context = pageContext(address, pageType, services);
  const loaded = await (takeStartedDataLoad(client, url) ??
    definition.loadData(context));
  if (loaded.status === 'not-found') {
    return browserNotFound(pages, request, services, route);
  }
  return readyPageData(pageType, definition, context, loaded.data);
}

/** The page in its layout, or alone without one. */
function LayoutFrame({
  layout: Layout,
  children,
}: {
  layout: PageLayoutComponent | null;
  children: ReactNode;
}) {
  return Layout ? <Layout>{children}</Layout> : children;
}

/**
 * The layout route above the pages (`[[...slug]]/layout` of the Next.js runtime): the layout of
 * the page the address shows, which stays mounted while the pages under it change, and the
 * layout of the address when the page has no data (its loader failed). Its boundary renders the
 * error page when the layout itself fails.
 */
export function createRuntimeLayoutRoute({
  ErrorPage,
  ...route
}: CreateRuntimeLayoutRouteOptions) {
  function PageLayout() {
    const matches = useMatches();
    const { pathname } = useLocation();
    const localeSegments = useLocaleSegments();
    const page = matches[matches.length - 1]?.loaderData as
      | RuntimePageData
      | undefined;
    const layout = use(
      page
        ? loadPageLayout(route, page)
        : loadAddressLayout(route, pathname, localeSegments)
    );
    return (
      <ShellSkeletonContext.Provider value={route.ShellSkeleton ?? null}>
        <LayoutFrame layout={layout}>
          <Outlet />
        </LayoutFrame>
      </ShellSkeletonContext.Provider>
    );
  }

  function ErrorBoundary() {
    return <RouteErrorPage ErrorPage={ErrorPage} />;
  }

  return { Layout: PageLayout, ErrorBoundary };
}

export function createRuntimePageRoute(options: CreateRuntimePageRouteOptions) {
  const { ErrorPage, titleTemplate, ...route } = options;

  function Page() {
    const page = useLoaderData() as RuntimePageData;
    const { pathname, search } = useLocation();
    return (
      <Fragment key={`${pathname}${search}`}>
        {usePageElement(route.pages, page)}
        {page.pendingMetadata ? (
          <PendingMetadata load={page.pendingMetadata} />
        ) : null}
      </Fragment>
    );
  }

  /** The 404 page or the error page, inside the layout. */
  function ErrorBoundary() {
    const error = useRouteError();
    if (isNotFoundError(error)) return <RenderedNotFound route={route} />;
    return <RouteErrorPage ErrorPage={ErrorPage} />;
  }

  /**
   * A client navigation, without the server: the page of the address with its modules and
   * layout loaded and its `loadData` run with the app's Apollo client, as the server loader
   * resolves it. A page closed to visitors without a session is left to its browser guard.
   * The first page comes from the server render (no `hydrate`).
   */
  function clientLoader({
    url,
  }: ClientLoaderFunctionArgs): Promise<RuntimePageData> {
    return loadBrowserPage(route.pages, url, getBrowserApolloClient(), {
      route,
    });
  }

  /**
   * The theme's `<meta>` from the root, under the page's own metadata with the site's: the
   * title in the app's template, the canonical address, the page in each language, Open
   * Graph and Twitter tags, and the page's schema.org documents.
   */
  const meta: MetaFunction = ({ loaderData, matches, location }) => {
    const rootMeta = matches[0]?.meta ?? [];
    const page = loaderData as RuntimePageData | undefined;
    // The error page has the root's tags; a missing page stays out of search results.
    if (!page) return rootMeta;
    if (page.kind === 'not-found') {
      return mergeMetaDescriptors(
        rootMeta,
        toMetaDescriptors({ robots: 'noindex' })
      );
    }
    const root = matches.find((match) => match.id === 'root')?.loaderData as
      | RuntimeRootData
      | undefined;
    return mergeMetaDescriptors(
      rootMeta,
      toMetaDescriptors(
        pageSiteMetadata(page.metadata, root, location.pathname, titleTemplate)
      )
    );
  };

  return { Page, ErrorBoundary, clientLoader, meta };
}
