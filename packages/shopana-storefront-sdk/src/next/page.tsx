/**
 * This file is exported as source (.tsx) via package.json exports.
 * All imports from SDK modules MUST use package imports (@shopana/storefront-sdk/...)
 * instead of relative imports (../modules/...) to ensure the same module instances
 * are used as external consumers.
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { PageTemplate, TemplateParams } from '../core/types';
import { Builder } from '../core/Builder';
import { parseRoute } from '../utils/routeParser';
import { notFound } from 'next/navigation';
import type { SerializablePreloadedQuery } from '../graphql/relay/loadSerializableQuery';
import { loadHomeServerQuery } from '@shopana/storefront-sdk/modules/home/next/loaders/loadHomeServerQuery';
import { HomeDataProvider } from '@shopana/storefront-sdk/modules/home/react/providers/HomeDataProvider';
import { loadProductServerQuery } from '@shopana/storefront-sdk/modules/product/next/loaders/loadProductServerQuery';
import { ProductDataProvider } from '@shopana/storefront-sdk/modules/product/react/providers/ProductDataProvider';
import { loadCollectionServerQuery } from '@shopana/storefront-sdk/modules/collection/next/loaders/loadCollectionServerQuery';
import { CollectionDataProvider } from '@shopana/storefront-sdk/modules/collection/react/providers/CollectionDataProvider';
import { loadSearchServerQuery } from '@shopana/storefront-sdk/modules/search/next/loaders/loadSearchServerQuery';
import { SearchDataProvider } from '@shopana/storefront-sdk/modules/search/react/providers/SearchDataProvider';
import type { RelayEnvironmentConfig } from '../graphql/relay/types';

type SlugParam = string[] | undefined;

interface PageProps {
  params: Promise<{
    slug?: SlugParam;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Dynamic template imports using switch
// Templates are resolved from user project via @/templates/* path
async function loadTemplate(pageType: string): Promise<PageTemplate | null> {
  try {
    switch (pageType) {
      case 'home':
        return (await import('@/templates/index/index')).default;
      case 'product':
        return (await import('@/templates/product/index')).default;
      case 'collection':
        return (await import('@/templates/collection/index')).default;
      case 'search':
        return (await import('@/templates/search/index')).default;
      case 'blog':
        return (await import('@/templates/blog/index')).default;
      case 'article':
        return (await import('@/templates/article/index')).default;
      case 'page':
        return (await import('@/templates/page/index')).default;
      case 'cart':
        return (await import('@/templates/cart/index')).default;
      case 'list-collections':
        return (await import('@/templates/list-collections/index')).default;
      case '404':
        return (await import('@/templates/404/index')).default;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load template for pageType: ${pageType}`, error);
    return null;
  }
}

interface HomePageData {
  type: 'home';
  preloadedQuery: SerializablePreloadedQuery<any, any>;
}

interface ProductPageData {
  type: 'product';
  preloadedQuery: SerializablePreloadedQuery<any, any>;
}

interface CollectionPageData {
  type: 'collection';
  preloadedQuery: SerializablePreloadedQuery<any, any>;
}

interface SearchPageData {
  type: 'search';
  preloadedQuery: SerializablePreloadedQuery<any, any>;
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
  environmentConfig: RelayEnvironmentConfig
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

export interface CreateSDKPageOptions {
  environmentConfig: RelayEnvironmentConfig;
}

/**
 * Factory function to create SDK page exports with configuration.
 *
 * @example
 * ```tsx
 * // app/[...slug]/page.tsx
 * import { createSDKPage } from '@shopana/storefront-sdk/next/page';
 * import { environmentConfig } from '@/config/environment.config';
 *
 * const { Page, generateMetadata } = createSDKPage({ environmentConfig });
 *
 * export default Page;
 * export { generateMetadata };
 * ```
 */
export function createSDKPage(options: CreateSDKPageOptions) {
  const { environmentConfig } = options;

  async function generateMetadata({
    params,
    searchParams,
  }: {
    params: Promise<{ slug?: SlugParam }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { pageType, params: routeParams } = parseRoute(
      resolvedParams.slug ?? []
    );

    return buildPageMetadata({
      pageType,
      params: routeParams,
      searchParams: resolvedSearchParams,
    });
  }

  async function Page({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const { pageType, params: routeParams } = parseRoute(
      resolvedParams.slug ?? []
    );

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
