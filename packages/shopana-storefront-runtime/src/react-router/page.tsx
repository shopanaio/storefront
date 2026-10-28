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
  Fragment,
  use,
  useEffect,
  useMemo,
  useState,
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
  getDefaultLocaleSegment,
  getKnownLocaleSegments,
  useLocaleSegments,
} from './document';
import { RouteErrorPage, type RuntimeErrorPage } from './error';
import {
  applyDocumentMetadata,
  mergeMetaDescriptors,
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
} from './page-modules';
import type { RuntimePageData } from './route-data';

export type {
  LoadRuntimeLayout,
  PageLayoutComponent,
  RuntimePageRouteDefinition,
} from './page-modules';

export interface CreateRuntimePageRouteOptions extends RuntimePageRouteDefinition {
  ErrorPage: RuntimeErrorPage;
}

export type CreateRuntimeLayoutRouteOptions = CreateRuntimePageRouteOptions;

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
  page: RuntimePageData
): TrackedPromise<PageLayoutComponent | null> {
  if (page.kind === 'page') {
    return loadRouteLayout(route, page.pageType, { isModule: false });
  }
  if (page.kind === 'module') {
    return loadModuleLayout(route, moduleRecord(page.pathname));
  }
  return loadRouteLayout(route, '404', { isModule: false });
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

/** The page itself, from loaded modules. */
function usePageElement(
  pages: RuntimePageModuleMap,
  page: RuntimePageData
): ReactNode {
  const client = useApolloClient();
  const services = useMemo(() => createClientPageServices(client), [client]);

  if (page.kind === 'page') {
    const modules = use(loadPageModules(pages, page.pageType));
    return renderPageElement(page.pageType, modules, page.data);
  }

  if (page.kind === 'module') {
    const { Component } = use(loadModulePage(moduleRecord(page.pathname)));
    const element = <Component {...page.props} services={services} />;
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
    <Builder template={template} data={page.data} pageType="404" />
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
  useEffect(() => {
    if (!open) return;
    let active = true;
    let restore: (() => void) | null = null;
    load().then(
      (metadata) => {
        if (active) restore = applyDocumentMetadata(metadata);
      },
      () => {}
    );
    return () => {
      active = false;
      restore?.();
    };
  }, [load, open]);
  return null;
}

export interface RuntimePageProps {
  pages: RuntimePageModuleMap;
  /** What the page route loaded for an address (see `useRouterPage`). */
  page: RuntimePageData;
}

/**
 * A page from the data the page route loaded for it, without the route: for an app that keeps
 * its own screens over the router's history (a mobile stack), each screen showing the page of
 * its entry while the router has moved on. The metadata of a page the browser loaded follows
 * as on the route; a missing page or an error goes to the boundary around.
 */
export function RuntimePage({ pages, page }: RuntimePageProps) {
  return (
    <>
      {usePageElement(pages, page)}
      {page.pendingMetadata ? (
        <PendingMetadata load={page.pendingMetadata} />
      ) : null}
    </>
  );
}

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

function pageContext(
  { request, searchParams, resolution }: ClientAddress,
  pageType: RuntimeRenderablePageType,
  services: RuntimePageServices
) {
  const routeParams =
    resolution.kind === 'sdk' ? { ...resolution.route.params } : {};
  return { pageType, request, routeParams, searchParams, services };
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
      <LayoutFrame layout={layout}>
        <Outlet />
      </LayoutFrame>
    );
  }

  function ErrorBoundary() {
    return <RouteErrorPage ErrorPage={ErrorPage} />;
  }

  return { Layout: PageLayout, ErrorBoundary };
}

export function createRuntimePageRoute(options: CreateRuntimePageRouteOptions) {
  const { ErrorPage, ...route } = options;

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

  /** The theme's 404 page, with its data loaded in the browser. */
  async function clientNotFound(
    request: SDKRequestContext,
    services: RuntimePageServices
  ): Promise<RuntimePageData> {
    const [modules] = await Promise.all([
      loadNotFoundModules(route.pages),
      loadRouteLayout(route, '404', { isModule: false }),
    ]);
    const data = await modules.definition.loadData({
      pageType: '404',
      request,
      services,
    });
    return { kind: 'not-found', data, metadata: {} };
  }

  /**
   * A client navigation, without the server: the page of the address with its modules and
   * layout loaded and its `loadData` run with the app's Apollo client, as the server loader
   * resolves it. A page closed to visitors without a session is left to its browser guard.
   * The first page comes from the server render (no `hydrate`).
   */
  async function clientLoader({
    url,
  }: ClientLoaderFunctionArgs): Promise<RuntimePageData> {
    const address = clientAddress(url);
    const { resolution, request } = address;
    const client = getBrowserApolloClient();
    const services = createClientPageServices(client);

    if (resolution.kind === 'module') {
      const [{ payload }] = await Promise.all([
        loadModulePage(resolution.match.record),
        loadModuleLayout(route, resolution.match.record),
      ]);
      return modulePageData(address, resolution, payload, services);
    }

    const { pageType } = resolution.route;
    if (pageType === '404') return clientNotFound(request, services);

    const [{ definition }] = await Promise.all([
      loadPageModules(route.pages, pageType),
      loadRouteLayout(route, pageType, { isModule: false }),
    ]);
    const context = pageContext(address, pageType, services);
    const loaded = await (takeStartedDataLoad(client, url) ??
      definition.loadData(context));
    if (loaded.status === 'not-found') return clientNotFound(request, services);
    return readyPageData(pageType, definition, context, loaded.data);
  }

  /** The theme's `<meta>` from the root, under the page's own metadata. */
  const meta: MetaFunction = ({ loaderData, matches }) =>
    mergeMetaDescriptors(
      matches[0]?.meta ?? [],
      toMetaDescriptors((loaderData as RuntimePageData | undefined)?.metadata)
    );

  return { Page, ErrorBoundary, clientLoader, meta };
}
