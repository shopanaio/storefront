'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  readInlineData,
  useFragment,
  usePreloadedQuery,
  useRelayEnvironment,
} from 'react-relay';
import useSerializablePreloadedQuery from '../../../../next/relay/useSerializablePreloadedQuery';
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
import SearchProductsFragmentNode, {
  type SearchProductsFragment$data,
  type SearchProductsFragment$key,
} from '../../core/graphql/fragments/__generated__/SearchProductsFragment.graphql';
import SearchProductCardFragmentNode, {
  type SearchProductCardFragment$key,
} from '../../core/graphql/fragments/__generated__/SearchProductCardFragment.graphql';

interface SearchDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<
    typeof SearchQueryNode,
    SearchQuery
  >;
  query: string;
}

type RawFilter = SearchProductsFragment$data['filters'][number];
type RawPriceRange = NonNullable<RawFilter['priceRange']>;

const toMoney = (money: RawPriceRange['min']) => ({
  amount: String(money.amount),
  currencyCode: money.currencyCode,
});

function transformFilter(rawFilter: RawFilter): SearchFilter {
  const base = {
    id: rawFilter.id,
    iid: rawFilter.id,
    handle: rawFilter.handle,
    title: rawFilter.title,
  };

  if (rawFilter.type === 'PRICE_RANGE' && rawFilter.priceRange) {
    return {
      ...base,
      type: 'price_range',
      minPrice: toMoney(rawFilter.priceRange.min),
      maxPrice: toMoney(rawFilter.priceRange.max),
    };
  }

  return {
    ...base,
    type: 'list',
    values: rawFilter.values.map((value) => ({
      id: value.id,
      iid: value.id,
      handle: value.handle,
      title: value.title,
      count: value.count,
      input: value.input,
      selected: value.selected,
    })),
  };
}

const toImage = (
  media:
    | {
        readonly id?: string;
        readonly image?: { readonly url: unknown } | null;
      }
    | null
    | undefined
): SearchImage | null =>
  media?.id && media.image?.url
    ? { id: media.id, url: String(media.image.url) }
    : null;

function transformProduct(
  productRef: SearchProductCardFragment$key
): SearchProduct {
  const rawProduct = readInlineData(SearchProductCardFragmentNode, productRef);
  const selectedVariant = rawProduct.selectedVariant;
  const seen = new Set<string>();
  const gallery = [
    toImage(rawProduct.cover),
    ...rawProduct.gallery.edges.map((edge) => toImage(edge.node)),
  ].filter((image): image is SearchImage => {
    if (!image || seen.has(image.id)) {
      return false;
    }
    seen.add(image.id);
    return true;
  });

  return {
    id: selectedVariant?.id ?? rawProduct.id,
    title: selectedVariant?.title ?? rawProduct.title,
    handle: selectedVariant?.handle ?? rawProduct.handle,
    description: rawProduct.description?.text ?? null,
    product: {
      id: rawProduct.id,
      handle: rawProduct.handle,
      title: rawProduct.title,
    },
    rating: {
      rating: rawProduct.rating.rating,
      count: rawProduct.rating.count,
    },
    cover: gallery[0] ?? null,
    gallery,
    price: {
      amount: String(selectedVariant?.price?.amount ?? '0'),
      currencyCode: selectedVariant?.price?.currencyCode ?? 'USD',
    },
    compareAtPrice: selectedVariant?.compareAtPrice
      ? {
          amount: String(selectedVariant.compareAtPrice.amount),
          currencyCode: selectedVariant.compareAtPrice.currencyCode,
        }
      : null,
    stockStatus: {
      isAvailable: selectedVariant?.isAvailable ?? false,
    },
    options: rawProduct.options.map((option) => ({
      id: option.id,
      handle: option.handle,
      title: option.title,
      displayType: option.displayType,
      values: option.values.map((value) => ({
        id: value.id,
        title: value.title,
        handle: value.handle,
        swatch: value.swatch
          ? {
              id: `${value.id}:swatch`,
              color: value.swatch.color
                ? String(value.swatch.color)
                : null,
              color2: value.swatch.color2
                ? String(value.swatch.color2)
                : null,
              image: toImage(value.swatch.image),
              displayType: value.swatch.displayType,
            }
          : null,
      })),
    })),
    selectedOptions:
      selectedVariant?.selectedOptions.map(
        (selection) => selection.optionValue.handle
      ) ?? [],
  };
}

function transformSearchResults(
  rawProducts: SearchProductsFragment$data | null
): SearchResults | null {
  if (!rawProducts) {
    return null;
  }

  return {
    totalCount: rawProducts.totalCount,
    filters: rawProducts.filters.map(transformFilter),
    pageInfo: {
      hasNextPage: rawProducts.pageInfo.hasNextPage,
      endCursor: rawProducts.pageInfo.endCursor,
    },
    products: rawProducts.edges.map((edge) =>
      transformProduct(edge.node as SearchProductCardFragment$key)
    ),
  };
}

function transformQueryData(
  data: SearchQuery['response'],
  productsData: SearchProductsFragment$data | null,
  query: string
): SearchTemplateData {
  return {
    pageType: 'search',
    raw: data,
    query,
    results: transformSearchResults(productsData),
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
  const productsData = useFragment<SearchProductsFragment$key>(
    SearchProductsFragmentNode,
    rawData.searchProducts
  );
  const data = useMemo(
    () => transformQueryData(rawData, productsData, query),
    [rawData, productsData, query]
  );

  return (
    <SearchDataContext.Provider value={{ data }}>
      {children}
    </SearchDataContext.Provider>
  );
}
