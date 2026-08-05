/**
 * This file is exported as source (.tsx) via package.json exports.
 * The generated adapter supplies project templates and module registrations.
 */
import React from 'react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type {
  PageTemplate,
  PageType,
  TemplateParams,
} from '@shopana/storefront-sdk/core/types';
import { Builder } from '@shopana/storefront-sdk/core/Builder';
import { notFound } from 'next/navigation';
import type { SerializableApolloQuery } from '@shopana/storefront-sdk/graphql/apollo/loadSerializableQuery';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import type {
  SdkCollectionQuery,
  SdkCollectionQueryVariables,
  SdkHomePageQuery,
  SdkHomePageQueryVariables,
  SdkProductQuery,
  SdkProductQueryVariables,
  SdkSearchQuery,
  SdkSearchQueryVariables,
} from '@shopana/storefront-sdk/graphql/apollo/generated/operations';
import { loadHomeServerQuery } from '@shopana/storefront-sdk/modules/home/next/loaders/loadHomeServerQuery';
import { HomeDataProvider } from '@shopana/storefront-sdk/modules/home/react/providers/HomeDataProvider';
import { loadProductServerQuery } from '@shopana/storefront-sdk/modules/product/next/loaders/loadProductServerQuery';
import { ProductDataProvider } from '@shopana/storefront-sdk/modules/product/react/providers/ProductDataProvider';
import { loadCollectionServerQuery } from '@shopana/storefront-sdk/modules/collection/next/loaders/loadCollectionServerQuery';
import { CollectionDataProvider } from '@shopana/storefront-sdk/modules/collection/react/providers/CollectionDataProvider';
import { loadSearchServerQuery } from '@shopana/storefront-sdk/modules/search/next/loaders/loadSearchServerQuery';
import { SearchDataProvider } from '@shopana/storefront-sdk/modules/search/react/providers/SearchDataProvider';
import {
  getRequestContext,
  type SDKRequestContext,
} from '@shopana/storefront/next/headers';
import {
  type DynamicModulePageProps,
  type ModuleExport,
} from '@shopana/storefront-sdk/registry';
import { resolveRuntimeRoute } from './route';

type SlugParam = string[] | undefined;

interface PageProps {
  params: Promise<{
    locale?: string;
    slug?: SlugParam;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

interface HomePageData {
  type: 'home';
  preloadedQuery: SerializableApolloQuery<
    SdkHomePageQuery,
    SdkHomePageQueryVariables
  >;
}

interface ProductPageData {
  type: 'product';
  preloadedQuery: SerializableApolloQuery<
    SdkProductQuery,
    SdkProductQueryVariables
  >;
}

interface CollectionPageData {
  type: 'collection';
  preloadedQuery: SerializableApolloQuery<
    SdkCollectionQuery,
    SdkCollectionQueryVariables
  >;
}

interface SearchPageData {
  type: 'search';
  preloadedQuery: SerializableApolloQuery<
    SdkSearchQuery,
    SdkSearchQueryVariables
  >;
  query: string;
}

type LoadedPageData =
  | HomePageData
  | ProductPageData
  | CollectionPageData
  | SearchPageData
  | null;

async function loadPageData(
  ctx: TemplateParams,
  environmentConfig: ApolloEnvironmentConfig
): Promise<LoadedPageData> {
  const { pageType, params, searchParams } = ctx;

  switch (pageType) {
    case 'home': {
      const preloadedQuery = await loadHomeServerQuery({
        environmentConfig,
      });

      return { type: 'home', preloadedQuery };
    }
    case 'product': {
      const handle = params?.handle;
      if (!handle) {
        return null;
      }

      const preloadedQuery = await loadProductServerQuery({
        environmentConfig,
        handle,
      });

      return { type: 'product', preloadedQuery };
    }
    case 'collection': {
      const handle = params?.handle;
      if (!handle) {
        return null;
      }

      const preloadedQuery = await loadCollectionServerQuery({
        environmentConfig,
        handle,
      });

      return { type: 'collection', preloadedQuery };
    }
    case 'search': {
      const query = typeof searchParams?.q === 'string' ? searchParams.q : '';

      const preloadedQuery = await loadSearchServerQuery({
        environmentConfig,
        query,
      });

      return { type: 'search', preloadedQuery, query };
    }
    default:
      return null;
  }
}

// Internal framework metadata builder (will be replaced with SDK later)
// This is where framework generates SEO metadata
async function buildPageMetadata(ctx: TemplateParams): Promise<Metadata> {
  // TODO: Replace with actual SDK implementation
  const { pageType } = ctx;

  if (pageType === '404') {
    return { title: 'Page not found' };
  }

  return {
    title: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`,
  };
}

function buildModuleMetadata(slug: string): Metadata {
  const title = slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return { title: title || 'Page' };
}

function PageWrapper({
  data,
  children,
}: {
  data: LoadedPageData;
  children: ReactNode;
}) {
  if (!data) {
    return <>{children}</>;
  }

  switch (data.type) {
    case 'home': {
      return (
        <HomeDataProvider preloadedQuery={data.preloadedQuery}>
          {children}
        </HomeDataProvider>
      );
    }
    case 'product': {
      return (
        <ProductDataProvider preloadedQuery={data.preloadedQuery}>
          {children}
        </ProductDataProvider>
      );
    }
    case 'collection': {
      return (
        <CollectionDataProvider preloadedQuery={data.preloadedQuery}>
          {children}
        </CollectionDataProvider>
      );
    }
    case 'search': {
      return (
        <SearchDataProvider
          preloadedQuery={data.preloadedQuery}
          query={data.query}
        >
          {children}
        </SearchDataProvider>
      );
    }
    default:
      return <>{children}</>;
  }
}

export interface CreateRuntimePageOptions {
  environmentConfig: ApolloEnvironmentConfig;
  modulesContext?: ReturnType<typeof require.context>;
  loadTemplate: (pageType: PageType) => Promise<PageTemplate | null>;
}

/**
 * Extracts component from a module namespace or returns the component itself.
 */
function getComponentFromModule(
  input: ModuleExport<DynamicModulePageProps>
): React.ComponentType<DynamicModulePageProps> {
  if (
    input &&
    typeof input === 'object' &&
    'default' in (input as Record<string, unknown>)
  ) {
    return (input as { default: React.ComponentType<DynamicModulePageProps> })
      .default;
  }
  return input as React.ComponentType<DynamicModulePageProps>;
}

export type { SDKRequestContext };

/**
 * Factory function to create SDK page exports with configuration.
 *
 * @example
 * ```tsx
 * // app/[...slug]/page.tsx
 * import { createRuntimePage } from '@shopana/storefront/next/page';
 * import { environmentConfig } from '@src/config/environment.config';
 *
 * const { Page, generateMetadata } = createRuntimePage({
 *   environmentConfig,
 *   loadTemplate,
 * });
 *
 * export default Page;
 * export { generateMetadata };
 * ```
 */
export function createRuntimePage(options: CreateRuntimePageOptions) {
  const { environmentConfig, modulesContext, loadTemplate } = options;

  // Auto-load modules from context if provided
  if (modulesContext) {
    modulesContext.keys().forEach((key) => modulesContext(key));
  }

  async function generateMetadata({
    params,
    searchParams,
  }: {
    params: Promise<{ locale?: string; slug?: SlugParam }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const requestContext = await getRequestContext();
    const resolution = resolveRuntimeRoute(
      requestContext.pathname,
      resolvedParams.locale
    );

    if (resolution.kind === 'module') {
      return buildModuleMetadata(resolution.match.record.slug);
    }

    return buildPageMetadata({
      pageType: resolution.route.pageType,
      params: resolution.route.params,
      searchParams: resolvedSearchParams,
    });
  }

  async function Page(props: PageProps) {
    const params = await props.params;
    const segments = params.slug ?? [];

    // Get URL context from middleware headers for path matching
    const requestContext = await getRequestContext();
    const pathname = requestContext.pathname;

    const locale = params.locale;
    const resolution = resolveRuntimeRoute<
      ModuleExport<DynamicModulePageProps>
    >(pathname, locale);

    if (resolution.kind === 'module') {
      const matchResult = resolution.match;
      const rawSearchParams = await props.searchParams;
      // Convert to plain object to avoid "Classes or null prototypes are not supported" error
      const searchParams = rawSearchParams ? { ...rawSearchParams } : {};
      const modulePayload = await matchResult.record.loader();

      return React.createElement(getComponentFromModule(modulePayload), {
        params: {
          locale: params.locale ?? 'en',
          module: segments,
        },
        searchParams,
        segments: segments.slice(1),
        pathParams: matchResult.params ? { ...matchResult.params } : {},
      });
    }

    // Fall back to SDK page handler
    const resolvedSearchParams = await props.searchParams;

    const { pageType, params: routeParams } = resolution.route;

    // Handle 404
    if (pageType === '404') {
      notFound();
    }

    // Load template dynamically from user project
    const template = await loadTemplate(pageType);

    if (!template) {
      console.error(`No template found for pageType: ${pageType}`);
      notFound();
    }

    // Load data using framework's internal data loader
    const data = await loadPageData(
      {
        pageType,
        params: routeParams,
        searchParams: resolvedSearchParams,
      },
      environmentConfig
    );

    return (
      <PageWrapper data={data}>
        <Builder
          template={template}
          data={data}
          pageType={pageType}
          fallback={<div>Loading...</div>}
        />
      </PageWrapper>
    );
  }

  return { Page, generateMetadata };
}
