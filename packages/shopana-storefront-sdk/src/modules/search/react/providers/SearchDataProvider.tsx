'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { usePreloadedQuery, useRelayEnvironment } from 'react-relay';
import { useSerializablePreloadedQuery } from '../../../../graphql/relay/useSerializablePreloadedQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { SearchDataContext } from '../context/SearchDataContext';
import type {
  SearchTemplateData,
  SearchResults,
  SearchProduct,
  SearchFilter,
  SearchImage,
} from '../../core/types';
import SearchQueryNode, {
  SearchQuery,
} from '../../core/graphql/queries/__generated__/SearchQuery.graphql';

interface SearchDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<
    typeof SearchQueryNode,
    SearchQuery
  >;
  query: string;
}

function transformFilter(rawFilter: any): SearchFilter {
  const base = {
    id: rawFilter.id,
    iid: rawFilter.iid,
    handle: rawFilter.handle,
    title: rawFilter.title,
  };

  if ('minPrice' in rawFilter && 'maxPrice' in rawFilter) {
    return {
      ...base,
      type: 'price_range' as const,
      minPrice: rawFilter.minPrice,
      maxPrice: rawFilter.maxPrice,
    };
  }

  if ('minRate' in rawFilter && 'maxRate' in rawFilter) {
    return {
      ...base,
      type: 'rating_range' as const,
      minRate: rawFilter.minRate,
      maxRate: rawFilter.maxRate,
    };
  }

  return {
    ...base,
    type: 'list' as const,
    values:
      rawFilter.values?.map((v: any) => ({
        id: v.id,
        iid: v.iid,
        handle: v.handle,
        title: v.title,
        count: v.count,
      })) ?? [],
  };
}

function transformProduct(rawProduct: any): SearchProduct | null {
  if (!rawProduct?.id) {
    return null;
  }

  const gallery: SearchImage[] = (rawProduct.gallery?.edges ?? [])
    .map((e: any) => e?.node)
    .filter((n: any): n is SearchImage => Boolean(n?.id && n?.url))
    .map((n: any) => ({ id: n.id, url: n.url }));

  return {
    id: rawProduct.id,
    title: rawProduct.title,
    handle: rawProduct.handle,
    description: rawProduct.description,
    product: {
      id: rawProduct.product?.id ?? '',
      handle: rawProduct.product?.handle ?? '',
      title: rawProduct.product?.title ?? '',
    },
    rating: rawProduct.rating
      ? {
          rating: rawProduct.rating.rating,
          count: rawProduct.rating.count,
        }
      : null,
    cover: rawProduct.cover
      ? { id: rawProduct.cover.id, url: rawProduct.cover.url }
      : null,
    gallery,
    price: {
      amount: rawProduct.price?.amount ?? '0',
      currencyCode: rawProduct.price?.currencyCode ?? 'USD',
    },
    compareAtPrice: rawProduct.compareAtPrice
      ? {
          amount: rawProduct.compareAtPrice.amount,
          currencyCode: rawProduct.compareAtPrice.currencyCode,
        }
      : null,
    stockStatus: rawProduct.stockStatus
      ? {
          handle: rawProduct.stockStatus.handle,
          isAvailable: rawProduct.stockStatus.isAvailable,
        }
      : null,
    options: (rawProduct.options ?? []).map((o: any) => ({
      id: o.id,
      handle: o.handle,
      title: o.title,
      displayType: o.displayType,
      values: (o.values ?? []).map((v: any) => ({
        id: v.id,
        title: v.title,
        handle: v.handle,
        swatch: v.swatch
          ? {
              id: v.swatch.id,
              color: v.swatch.color,
              color2: v.swatch.color2,
              image: v.swatch.image
                ? { id: v.swatch.image.id, url: v.swatch.image.url }
                : null,
              displayType: v.swatch.displayType,
            }
          : null,
      })),
    })),
    selectedOptions: rawProduct.selectedOptions as Record<
      string,
      string
    > | null,
  };
}

function transformSearchResults(rawProducts: any): SearchResults | null {
  if (!rawProducts) {
    return null;
  }

  const products = (rawProducts.edges ?? [])
    .map((e: any) => transformProduct(e?.node))
    .filter((p: SearchProduct | null): p is SearchProduct => p !== null);

  const filters = (rawProducts.filters ?? []).map(transformFilter);

  return {
    totalCount: rawProducts.totalCount ?? 0,
    filters,
    pageInfo: {
      hasNextPage: rawProducts.pageInfo?.hasNextPage ?? false,
      endCursor: rawProducts.pageInfo?.endCursor,
    },
    products,
  };
}

function transformQueryData(
  data: SearchQuery['response'],
  query: string
): SearchTemplateData {
  return {
    pageType: 'search',
    raw: data,
    query,
    results: transformSearchResults(data.search?.products),
  };
}

export function SearchDataProvider({
  children,
  preloadedQuery,
  query,
}: SearchDataProviderProps) {
  const environment = useRelayEnvironment();

  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery
  );

  const rawData = usePreloadedQuery<SearchQuery>(
    SearchQueryNode,
    queryReference
  );

  const data = useMemo(
    () => transformQueryData(rawData, query),
    [rawData, query]
  );

  return (
    <SearchDataContext.Provider value={{ data }}>
      {children}
    </SearchDataContext.Provider>
  );
}
