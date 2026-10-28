/**
 * Server side of the React Router runtime: the request middleware, the root loader and the
 * page loader. Imported by the generated route modules for their server exports only.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import {
  createContext,
  data,
  redirect,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
} from 'react-router';
import { isPageNotFoundError } from '@shopana/storefront-sdk/core/PageNotFoundError';
import {
  loadStorefrontLocales,
  resolveStorefrontLocale,
} from '@shopana/storefront-sdk/modules/localization/server';
import {
  STOREFRONT_LOCALE_HEADER,
  splitLocaleFromPathname,
  type StorefrontLocale,
  type StorefrontLocales,
} from '@shopana/storefront-sdk/routing';
import { loadAppProps } from '@shopana/storefront-sdk/server/app';
import {
  createServerRequestScope,
  provideServerRequestStorage,
  type ServerRequestScope,
} from '@shopana/storefront-sdk/server/requestScope';
import { admitClosedPage } from '../core/closed-page';
import { toSearchRecord, loadPageModules } from '../core/page-client';
import {
  assertSerializablePageData,
  type RuntimePageContext,
  type RuntimeRenderablePageType,
} from '../core/page-definition';
import {
  buildModuleMetadata,
  getModuleMetadataGenerator,
} from '../core/module-page';
import { createRuntimePageServices } from '../core/page-services';
import type { SDKRequestContext } from '../core/request-context';
import { resolveRuntimeRoute } from '../core/route';
import type { RuntimeAppDefinition } from './app';
import { getRequestContext } from './headers';
import { isLocalizedPath, localePrefixRedirect } from './locale-routing';
import {
  loadModuleLayout,
  loadModulePage,
  loadNotFoundModules,
  loadRouteLayout,
  type RuntimePageRouteDefinition,
} from './page-modules';
import type { RuntimePageData, RuntimeRootData } from './route-data';

export type { RuntimePageData, RuntimeRootData };

/** A middleware of the theme (`src/runtime/route-middleware.ts`), run after the runtime's. */
export type RuntimeMiddleware = MiddlewareFunction<Response>;

const storage = new AsyncLocalStorage<ServerRequestScope>();
provideServerRequestStorage(storage);

/** The locale of the request, as the runtime middleware matched it. */
export interface RuntimeRequestLocale {
  /** Store languages the locale segment was matched against. */
  locales: StorefrontLocales;
  locale: StorefrontLocale;
  /** The locale segment of the address; null for the default locale without a prefix. */
  segment: string | null;
}

/** Set by the runtime middleware for the middleware, loaders and actions after it. */
export const runtimeRequestLocale = createContext<RuntimeRequestLocale>();

/**
 * The root middleware of a storefront: matches the locale segment against the store languages
 * (cached for a minute), redirects an address to its locale prefix form, and runs the rest of
 * the request (loaders, actions, the server render) in a request scope with the storefront
 * locale header, which the SDK server modules read.
 */
export function createRuntimeMiddleware(
  app: RuntimeAppDefinition
): MiddlewareFunction<Response> {
  return async ({ request, url, context }, next) => {
    const locales = await loadStorefrontLocales(app.environmentConfig);
    const { locale: segment } = splitLocaleFromPathname(
      url.pathname,
      locales.locales.map((locale) => locale.segment)
    );

    if (isLocalizedPath(url.pathname)) {
      const target = localePrefixRedirect(url, segment, locales, app.routing);
      if (target) throw redirect(target, 307);
    }

    const locale = resolveStorefrontLocale(locales, segment);
    const headers = new Headers(request.headers);
    headers.set(STOREFRONT_LOCALE_HEADER, locale.tag);
    context.set(runtimeRequestLocale, { locales, locale, segment });

    return storage.run(createServerRequestScope(url, headers), next);
  };
}

/** The root loader: the store, languages, cart, session and preloaded layout queries. */
export async function loadRuntimeRoot(
  app: RuntimeAppDefinition
): Promise<RuntimeRootData> {
  return {
    app: await loadAppProps({
      environmentConfig: app.environmentConfig,
      routing: app.routing,
      cartConfig: app.cartConfig,
      preload: app.preload,
    }),
  };
}

/**
 * The loader of the page route: resolves the address to a module page or a reserved page,
 * runs the definition's `loadData` and `preload` with the request client, and answers a missing
 * page with the theme's 404 page and status. Metadata is computed here, on the server, from the
 * data the page renders with.
 */
export function createRuntimePageLoader(
  app: RuntimeAppDefinition,
  route: RuntimePageRouteDefinition
) {
  const services = createRuntimePageServices(app.environmentConfig);

  async function notFound(request: SDKRequestContext) {
    const [modules] = await Promise.all([
      loadNotFoundModules(route.pages),
      loadRouteLayout(route, '404', { isModule: false }),
    ]);
    const notFoundData = await modules.definition.loadData({
      pageType: '404',
      request,
      services,
    });
    if (process.env.NODE_ENV !== 'production') {
      assertSerializablePageData('404', notFoundData);
    }
    return data<RuntimePageData>(
      { kind: 'not-found', data: notFoundData, metadata: {} },
      { status: 404 }
    );
  }

  async function loadPage(
    pageType: RuntimeRenderablePageType,
    context: RuntimePageContext<RuntimeRenderablePageType>
  ) {
    const [{ definition }] = await Promise.all([
      loadPageModules(route.pages, pageType),
      loadRouteLayout(route, pageType, { isModule: false }),
    ]);
    const loaded = await definition.loadData(context);
    const result =
      loaded.status === 'ready' && definition.preload
        ? await definition.preload(context, loaded.data)
        : loaded;
    if (result.status === 'not-found') return null;

    if (process.env.NODE_ENV !== 'production') {
      assertSerializablePageData(pageType, result.data);
    }

    return {
      kind: 'page',
      pageType,
      data: result.data,
      cacheState: definition.preload
        ? await services.extractCacheState()
        : null,
      metadata:
        (await definition.generateMetadata?.(context, result.data)) ?? {},
    } satisfies RuntimePageData;
  }

  return async function loader({
    request: incoming,
    url,
    context,
  }: LoaderFunctionArgs) {
    const request = await getRequestContext();
    const { locales, segment } = context.get(runtimeRequestLocale);
    const localeSegment = segment ?? locales.defaultLocale.segment;
    const resolution = resolveRuntimeRoute(url.pathname, segment ?? undefined);
    const searchParams = toSearchRecord(url.searchParams);

    try {
      if (resolution.kind === 'module') {
        const { match } = resolution;
        // Before the module loads: a closed page renders nothing for a visitor without a session.
        const closedPage = match.requiresSession
          ? await admitClosedPage(
              request,
              incoming.headers.get('cookie'),
              localeSegment
            )
          : null;
        if (closedPage && !closedPage.admitted) {
          throw redirect(closedPage.redirectTo);
        }
        const segments = resolution.pathname.split('/').filter(Boolean);
        const props = {
          params: { locale: localeSegment, module: segments },
          searchParams,
          pathParams: match.params ? { ...match.params } : {},
        };
        const [{ payload }] = await Promise.all([
          loadModulePage(match.record),
          loadModuleLayout(route, match.record),
        ]);
        const generate = getModuleMetadataGenerator(payload);

        return {
          kind: 'module',
          slug: match.record.slug,
          pathname: resolution.pathname,
          props,
          closedPageRedirect: closedPage?.redirectTo ?? null,
          metadata: generate
            ? await generate({ ...props, services })
            : buildModuleMetadata(match.record.slug),
        } satisfies RuntimePageData;
      }

      const { pageType, params: routeParams } = resolution.route;
      if (pageType === '404') return notFound(request);

      const page = await loadPage(pageType, {
        pageType,
        request,
        // A plain object, like the record the Next.js runtime parses from its cache key.
        routeParams: { ...routeParams },
        searchParams,
        services,
      });
      return page ?? notFound(request);
    } catch (error) {
      if (isPageNotFoundError(error)) return notFound(request);
      throw error;
    }
  };
}
