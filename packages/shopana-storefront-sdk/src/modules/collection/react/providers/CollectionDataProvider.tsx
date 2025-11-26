'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { usePreloadedQuery, useRelayEnvironment } from 'react-relay';
import { useSerializablePreloadedQuery } from '../../../../graphql/relay/useSerializablePreloadedQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { CollectionDataContext } from '../context/CollectionDataContext';
import type {
  CollectionTemplateData,
  Collection,
  CollectionListing,
  CollectionProduct,
  CollectionFilter,
  CollectionImage,
} from '../../core/types';
import CollectionQueryNode, {
  CollectionQuery,
} from '../../core/graphql/queries/__generated__/CollectionQuery.graphql';

interface CollectionDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<
    typeof CollectionQueryNode,
    CollectionQuery
  >;
}

function transformFilter(rawFilter: any): CollectionFilter {
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
    values: rawFilter.values?.map((v: any) => ({
      id: v.id,
      iid: v.iid,
      handle: v.handle,
      title: v.title,
      count: v.count,
    })) ?? [],
  };
}

function transformProduct(rawProduct: any): CollectionProduct | null {
  if (!rawProduct?.id) {
    return null;
  }

  const gallery: CollectionImage[] = (rawProduct.gallery?.edges ?? [])
    .map((e: any) => e?.node)
    .filter((n: any): n is CollectionImage => Boolean(n?.id && n?.url))
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
    selectedOptions: rawProduct.selectedOptions as Record<string, string> | null,
  };
}

function transformListing(rawCategory: any): CollectionListing | null {
  const rawListing = rawCategory?.listing;
  if (!rawListing) {
    return null;
  }

  const products = (rawListing.edges ?? [])
    .map((e: any) => transformProduct(e?.node))
    .filter((p: CollectionProduct | null): p is CollectionProduct => p !== null);

  const filters = (rawListing.filters ?? []).map(transformFilter);

  return {
    totalCount: rawListing.totalCount ?? 0,
    filters,
    pageInfo: {
      hasNextPage: rawListing.pageInfo?.hasNextPage ?? false,
      endCursor: rawListing.pageInfo?.endCursor,
    },
    products,
  };
}

function transformCollection(rawCategory: any): Collection | null {
  if (!rawCategory) {
    return null;
  }

  return {
    id: rawCategory.id,
    title: rawCategory.title,
    handle: rawCategory.handle,
    description: rawCategory.description,
    listing: transformListing(rawCategory),
  };
}

function transformQueryData(data: CollectionQuery['response']): CollectionTemplateData {
  return {
    pageType: 'collection',
    raw: data,
    collection: transformCollection(data.category),
  };
}

export function CollectionDataProvider({
  children,
  preloadedQuery,
}: CollectionDataProviderProps) {
  const environment = useRelayEnvironment();

  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery,
  );

  const rawData = usePreloadedQuery<CollectionQuery>(
    CollectionQueryNode,
    queryReference,
  );

  const data = useMemo(() => transformQueryData(rawData), [rawData]);

  return (
    <CollectionDataContext.Provider value={{ data }}>
      {children}
    </CollectionDataContext.Provider>
  );
}
