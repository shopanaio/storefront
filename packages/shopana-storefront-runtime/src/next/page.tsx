/**
 * Reserved storefront pages are loaded from the active theme. Module pages
 * keep their independent registry and execution path.
 */
import React, { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Builder } from '@shopana/storefront-sdk/core/Builder';
import { ClosedPageGuard } from '@shopana/storefront-sdk/modules/session/react/components/ClosedPageGuard';
import { ApolloCacheHydrator } from '@shopana/storefront-sdk/graphql/apollo/ApolloCacheHydrator';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import type {
  DynamicModulePageProps,
  ModuleExport,
} from '@shopana/storefront-sdk/registry';
import { getRequestContext, type SDKRequestContext } from './headers';
import { admitClosedPage } from './closed-page';
import {
  assertSerializablePageData,
  type RuntimePageModuleMap,
  type RuntimeRenderablePageType,
} from '../core/page-definition';
import {
  parseStableRouteParamsRecord,
  parseStableSearchParamsRecord,
  stableSerializeRuntimeRecord,
} from '../core/page-record';
import { loadRenderableDefinition } from '../core/page-registry';
import {
  buildModuleMetadata,
  getComponentFromModule,
  getModuleMetadataGenerator,
} from '../core/module-page';
import { createRuntimePageServices } from '../core/page-services';
import { resolveRuntimeRoute } from '../core/route';
import { getStorefrontRequestContext } from '@shopana/storefront-sdk/modules/store/server';
import type { StorefrontRoutingConfig } from '@shopana/storefront-sdk/routing';
import {
  jsonLdList,
  openGraphProductProperties,
  serializeJsonLd,
  type RuntimeMetadata,
} from '../core/metadata';
import { createSiteContext, withSiteMetadata } from '../core/site';
import { loadNextSite, toNextMetadata } from './seo';

type SlugParam = string[] | undefined;

interface PageProps {
  params: Promise<{
    locale?: string;
    slug?: SlugParam;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface CreateRuntimePageOptions {
  environmentConfig: ApolloEnvironmentConfig;
  /** The locale routing of the middleware: the addresses of a page in each language. */
  routing: StorefrontRoutingConfig;
  pages: RuntimePageModuleMap;
  modulesContext?: ReturnType<typeof require.context>;
}

export type { SDKRequestContext };

export function createRuntimePage(options: CreateRuntimePageOptions) {
  const { environmentConfig, modulesContext, pages, routing } = options;
  const services = createRuntimePageServices(environmentConfig);

  /** The site of the request, in the language of its locale segment. */
  const loadSite = cache(async (localeSegment: string) =>
    loadNextSite({
      environmentConfig,
      routing,
      requestUrl: (await getRequestContext()).url,
      localeSegment: localeSegment || null,
    })
  );

  if (modulesContext) {
    modulesContext.keys().forEach((key) => modulesContext(key));
  }

  const loadPageExecution = cache(
    async (
      pageType: RuntimeRenderablePageType,
      routeParamsKey: string,
      searchParamsKey: string,
      localeSegment: string
    ) => {
      const request = await getRequestContext();
      const definition = await loadRenderableDefinition(pages, pageType);
      const context = {
        pageType,
        request,
        routeParams: parseStableRouteParamsRecord(routeParamsKey),
        searchParams: parseStableSearchParamsRecord(searchParamsKey),
        services,
        site: createSiteContext(await loadSite(localeSegment)),
      };
      const loaded = await definition.loadData(context);
      const result =
        loaded.status === 'ready' && definition.preload
          ? await definition.preload(context, loaded.data)
          : loaded;

      if (result.status === 'ready' && process.env.NODE_ENV !== 'production') {
        assertSerializablePageData(pageType, result.data);
      }

      return { definition, context, result };
    }
  );

  /**
   * The page's metadata with the site's (canonical address, the page in each language, Open
   * Graph and Twitter tags), once per request: the metadata and the page's JSON-LD read it.
   */
  const loadPageMetadata = cache(
    async (
      localeSegment: string,
      slugKey: string,
      searchParamsKey: string
    ): Promise<RuntimeMetadata> => {
      const requestContext = await getRequestContext();
      const searchParams = parseStableSearchParamsRecord(searchParamsKey);
      const resolution = resolveRuntimeRoute(
        requestContext.pathname,
        localeSegment || undefined
      );
      const [site, { store }] = await Promise.all([
        loadSite(localeSegment),
        getStorefrontRequestContext(environmentConfig),
      ]);
      const withSite = (metadata: RuntimeMetadata) =>
        withSiteMetadata(metadata, {
          site,
          store,
          pathname: resolution.pathname,
        });

      if (resolution.kind === 'module') {
        const generate = getModuleMetadataGenerator(
          await resolution.match.record.loader()
        );
        if (!generate) {
          return withSite(buildModuleMetadata(resolution.match.record.slug));
        }
        return withSite(
          await generate({
            params: {
              locale: localeSegment,
              module: JSON.parse(slugKey) as string[],
            },
            searchParams: { ...searchParams },
            pathParams: resolution.match.params
              ? { ...resolution.match.params }
              : {},
            services,
          })
        );
      }

      const { pageType, params: routeParams } = resolution.route;
      if (pageType === '404') {
        notFound();
      }

      const execution = await loadPageExecution(
        pageType,
        stableSerializeRuntimeRecord(routeParams),
        searchParamsKey,
        localeSegment
      );

      if (execution.result.status === 'not-found') {
        notFound();
      }

      return withSite(
        (await execution.definition.generateMetadata?.(
          execution.context,
          execution.result.data
        )) ?? {}
      );
    }
  );

  async function metadataOf({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    return loadPageMetadata(
      resolvedParams.locale ?? '',
      JSON.stringify(resolvedParams.slug ?? []),
      stableSerializeRuntimeRecord((await searchParams) ?? {})
    );
  }

  async function generateMetadata(props: PageProps): Promise<Metadata> {
    return toNextMetadata(await metadataOf(props));
  }

  /**
   * What `Metadata` cannot carry: the page's schema.org documents, and the Open Graph type and
   * `product:*` tags of a product, which must be `<meta property>` (React puts them in the
   * document head).
   */
  async function PageHead({ props }: { props: PageProps }) {
    const metadata = await metadataOf(props);
    const openGraph = metadata.openGraph;
    const productProperties =
      openGraph?.type === 'product'
        ? [
            ['og:type', 'product'],
            ...openGraphProductProperties(openGraph.product),
          ]
        : [];
    return (
      <>
        {productProperties.map(([property, content]) => (
          <meta key={property} property={property} content={content} />
        ))}
        {jsonLdList(metadata.jsonLd).map((document, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(document) }}
          />
        ))}
      </>
    );
  }

  async function Page(props: PageProps) {
    const params = await props.params;
    const segments = params.slug ?? [];
    const requestContext = await getRequestContext();
    const resolution = resolveRuntimeRoute<
      ModuleExport<DynamicModulePageProps>
    >(requestContext.pathname, params.locale);

    if (resolution.kind === 'module') {
      // Before the module loads: a closed page renders nothing for a visitor without a session.
      const closedPageRedirect = resolution.match.requiresSession
        ? await admitClosedPage(requestContext, params.locale)
        : null;
      const rawSearchParams = await props.searchParams;
      const searchParams = rawSearchParams ? { ...rawSearchParams } : {};
      const modulePayload = await resolution.match.record.loader();

      const modulePage = React.createElement(
        getComponentFromModule(modulePayload),
        {
          params: {
            locale: params.locale ?? '',
            module: segments,
          },
          services,
          searchParams,
          pathParams: resolution.match.params
            ? { ...resolution.match.params }
            : {},
        }
      );

      return closedPageRedirect ? (
        <ClosedPageGuard redirectTo={closedPageRedirect}>
          {modulePage}
        </ClosedPageGuard>
      ) : (
        <>
          <PageHead props={props} />
          {modulePage}
        </>
      );
    }

    const { pageType, params: routeParams } = resolution.route;
    if (pageType === '404') {
      notFound();
    }

    const resolvedSearchParams = (await props.searchParams) ?? {};
    const execution = await loadPageExecution(
      pageType,
      stableSerializeRuntimeRecord(routeParams),
      stableSerializeRuntimeRecord(resolvedSearchParams),
      params.locale ?? ''
    );

    if (execution.result.status === 'not-found') {
      notFound();
    }

    const data = execution.result.data;
    const template = await execution.definition.loadTemplate();
    const content = (
      <Builder template={template} data={data} pageType={pageType} />
    );
    const Provider = execution.definition.Provider;
    const rendered = Provider ? (
      <Provider data={data}>{content}</Provider>
    ) : (
      content
    );
    const page = (
      <>
        <PageHead props={props} />
        {rendered}
      </>
    );
    if (!execution.definition.preload) return page;

    // What the preload put in the request client, applied before the sections read it.
    return (
      <ApolloCacheHydrator state={await services.extractCacheState()}>
        {page}
      </ApolloCacheHydrator>
    );
  }

  return { Page, generateMetadata };
}
