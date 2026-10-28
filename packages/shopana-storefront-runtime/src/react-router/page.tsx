'use client';

/**
 * The page routes of a storefront under React Router (the home page and `*`): render what
 * their loader resolved, a reserved page through Builder, a module page or the theme's 404
 * page, under the layout route that renders the layout of the page type. The layout stays
 * mounted from page to page; the page under it is new for every address, with the cache
 * snapshot of its `preload` applied first.
 *
 * A page a section finds missing while rendering (`notFound()`, `PageNotFound`) renders the 404
 * page in the page's boundary, under the layout of the page, the same on the server (status
 * 404) and in the browser. A 404 the loader answers renders in the 404 layout.
 */
import { Fragment, use, useMemo, type ReactNode } from 'react';
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
import { ApolloCacheHydrator } from '@shopana/storefront-sdk/graphql/apollo/ApolloCacheHydrator';
import { ClosedPageGuard } from '@shopana/storefront-sdk/modules/session/react/components/ClosedPageGuard';
import { splitLocaleFromPathname } from '@shopana/storefront-sdk/routing';
import { getServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';
import {
  createClientPageServices,
  loadPageModules,
  renderPageElement,
  track,
  type TrackedPromise,
} from '../core/page-client';
import type { SDKRequestContext } from '../core/request-context';
import { resolveRuntimeRoute } from '../core/route';
import { getKnownLocaleSegments, useLocaleSegments } from './document';
import { RouteErrorPage, type RuntimeErrorPage } from './error';
import { mergeMetaDescriptors, toMetaDescriptors } from './metadata';
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

/** Loads the modules a page renders with, so a client navigation renders without suspending. */
async function preloadPageModules(
  route: RuntimePageRouteDefinition,
  page: RuntimePageData
): Promise<void> {
  await Promise.all([
    loadPageLayout(route, page),
    page.kind === 'page'
      ? loadPageModules(route.pages, page.pageType)
      : page.kind === 'module'
        ? loadModulePage(moduleRecord(page.pathname))
        : loadNotFoundModules(route.pages),
  ]);
}

/** The page itself, from loaded modules. */
function usePageElement(
  route: RuntimePageRouteDefinition,
  page: RuntimePageData
): ReactNode {
  const client = useApolloClient();
  const services = useMemo(() => createClientPageServices(client), [client]);

  if (page.kind === 'page') {
    const modules = use(loadPageModules(route.pages, page.pageType));
    const element = renderPageElement(page.pageType, modules, page.data);
    return page.cacheState ? (
      <ApolloCacheHydrator state={page.cacheState}>
        {element}
      </ApolloCacheHydrator>
    ) : (
      element
    );
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

  const { definition, template } = use(loadNotFoundModules(route.pages));
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
  return usePageElement(route, { kind: 'not-found', data, metadata: {} });
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
        {usePageElement(route, page)}
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
   * On a client navigation: the server data, and the modules to render it with. The modules of
   * a reserved page start loading with the data, from the page type of the address (an
   * optimization: without the store languages yet, the address is not split).
   */
  async function clientLoader({ url, serverLoader }: ClientLoaderFunctionArgs) {
    const { pathname } = splitLocaleFromPathname(
      url.pathname,
      getKnownLocaleSegments()
    );
    const expected = resolveRuntimeRoute(pathname);
    if (expected.kind === 'sdk' && expected.pageType !== '404') {
      loadPageModules(route.pages, expected.pageType).catch(() => {});
    }
    const page = (await serverLoader()) as RuntimePageData;
    await preloadPageModules(route, page);
    return page;
  }

  /** The theme's `<meta>` from the root, under the page's own metadata. */
  const meta: MetaFunction = ({ loaderData, matches }) =>
    mergeMetaDescriptors(
      matches[0]?.meta ?? [],
      toMetaDescriptors((loaderData as RuntimePageData | undefined)?.metadata)
    );

  return { Page, ErrorBoundary, clientLoader, meta };
}
