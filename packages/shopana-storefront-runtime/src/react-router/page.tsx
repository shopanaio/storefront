'use client';

/**
 * The page routes of a storefront under React Router (the home page and `*`): render what
 * their loader resolved, a reserved page through Builder, a module page or the theme's 404
 * page, under the layout route that renders the layout of the page type. The layout stays
 * mounted from page to page; the page under it is new for every address, with the cache
 * snapshot of its `preload` applied first.
 */
import { Fragment, use, useMemo, type ReactNode } from 'react';
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
import { isPageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';
import { ApolloCacheHydrator } from '@shopana/storefront-sdk/graphql/apollo/ApolloCacheHydrator';
import { ClosedPageGuard } from '@shopana/storefront-sdk/modules/session/react/components/ClosedPageGuard';
import { splitLocaleFromPathname } from '@shopana/storefront-sdk/routing';
import {
  createClientPageServices,
  loadPageModules,
  renderPageElement,
  track,
  type TrackedPromise,
} from '../core/page-client';
import type { SDKRequestContext } from '../core/request-context';
import { resolveRuntimeRoute } from '../core/route';
import { getKnownLocaleSegments } from './document';
import { RouteErrorPage, type RuntimeErrorPage } from './error';
import { mergeMetaDescriptors, toMetaDescriptors } from './metadata';
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

function moduleRecord(pathname: string) {
  const resolution = resolveRuntimeRoute(pathname);
  if (resolution.kind !== 'module') {
    throw new Error(`No module page is registered for "${pathname}"`);
  }
  return resolution.match.record;
}

/** The layout of a page: its type's, a module's own, none for the 404 page. */
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
 * The layout route above the pages (`[[...slug]]/layout` of the Next.js runtime): the layout of
 * the page the address shows, which stays mounted while the pages under it change.
 */
export function createRuntimeLayoutRoute(route: RuntimePageRouteDefinition) {
  return function PageLayout() {
    const matches = useMatches();
    const page = matches[matches.length - 1]?.loaderData as
      | RuntimePageData
      | undefined;
    const Layout = page ? use(loadPageLayout(route, page)) : null;
    return Layout ? (
      <Layout>
        <Outlet />
      </Layout>
    ) : (
      <Outlet />
    );
  };
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

const notFoundDataLoads = new Map<string, TrackedPromise<unknown>>();

export function createRuntimePageRoute(options: CreateRuntimePageRouteOptions) {
  const { ErrorPage, ...route } = options;

  /** The page itself, from loaded modules. */
  function usePageElement(page: RuntimePageData): ReactNode {
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
    return Provider ? <Provider data={page.data}>{content}</Provider> : content;
  }

  function Page() {
    const page = useLoaderData() as RuntimePageData;
    const { pathname, search } = useLocation();
    return (
      <Fragment key={`${pathname}${search}`}>{usePageElement(page)}</Fragment>
    );
  }

  function NotFoundView({ data }: { data: unknown }) {
    return usePageElement({ kind: 'not-found', data, metadata: {} });
  }

  /**
   * The 404 page of a page whose section found its entity missing in the browser (the server
   * answers that with a 404 from `preload`): its data is loaded here, with the browser client.
   */
  function ClientNotFound() {
    const client = useApolloClient();
    const location = useLocation();
    const href = `${location.pathname}${location.search}`;
    let load = notFoundDataLoads.get(href);
    if (!load) {
      const url = new URL(href, 'http://storefront.local');
      const request: SDKRequestContext = {
        url: url.href,
        pathname: url.pathname,
        search: url.search,
        host: typeof window === 'undefined' ? url.host : window.location.host,
        searchParams: url.searchParams,
      };
      load = track(
        loadNotFoundModules(route.pages).then(({ definition }) =>
          definition.loadData({
            pageType: '404',
            request,
            services: createClientPageServices(client),
          })
        )
      );
      load.catch(() => notFoundDataLoads.delete(href));
      notFoundDataLoads.set(href, load);
    }
    return <NotFoundView data={use(load)} />;
  }

  function ErrorBoundary() {
    const error = useRouteError();
    if (
      isPageNotFoundError(error) ||
      (isRouteErrorResponse(error) && error.status === 404)
    ) {
      return <ClientNotFound />;
    }
    return <RouteErrorPage ErrorPage={ErrorPage} />;
  }

  /**
   * On a client navigation: the server data, and the modules to render it with. The modules of
   * a reserved page start loading with the data, from the page type of the address.
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
