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
  pages: RuntimePageModuleMap;
  modulesContext?: ReturnType<typeof require.context>;
}

export type { SDKRequestContext };

export function createRuntimePage(options: CreateRuntimePageOptions) {
  const { environmentConfig, modulesContext, pages } = options;
  const services = createRuntimePageServices(environmentConfig);

  if (modulesContext) {
    modulesContext.keys().forEach((key) => modulesContext(key));
  }

  const loadPageExecution = cache(
    async (
      pageType: RuntimeRenderablePageType,
      routeParamsKey: string,
      searchParamsKey: string
    ) => {
      const request = await getRequestContext();
      const definition = await loadRenderableDefinition(pages, pageType);
      const context = {
        pageType,
        request,
        routeParams: parseStableRouteParamsRecord(routeParamsKey),
        searchParams: parseStableSearchParamsRecord(searchParamsKey),
        services,
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

  async function generateMetadata({
    params,
    searchParams,
  }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = (await searchParams) ?? {};
    const requestContext = await getRequestContext();
    const resolution = resolveRuntimeRoute(
      requestContext.pathname,
      resolvedParams.locale
    );

    if (resolution.kind === 'module') {
      const generate = getModuleMetadataGenerator(
        await resolution.match.record.loader()
      );
      if (!generate) return buildModuleMetadata(resolution.match.record.slug);
      return generate({
        params: {
          locale: resolvedParams.locale ?? '',
          module: resolvedParams.slug ?? [],
        },
        searchParams: { ...resolvedSearchParams },
        pathParams: resolution.match.params
          ? { ...resolution.match.params }
          : {},
        services,
      });
    }

    const { pageType, params: routeParams } = resolution.route;
    if (pageType === '404') {
      notFound();
    }

    const execution = await loadPageExecution(
      pageType,
      stableSerializeRuntimeRecord(routeParams),
      stableSerializeRuntimeRecord(resolvedSearchParams)
    );

    if (execution.result.status === 'not-found') {
      notFound();
    }

    if (!execution.definition.generateMetadata) {
      return {};
    }

    return execution.definition.generateMetadata(
      execution.context,
      execution.result.data
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
        modulePage
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
      stableSerializeRuntimeRecord(resolvedSearchParams)
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
    const page = Provider ? (
      <Provider data={data}>{content}</Provider>
    ) : (
      content
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
