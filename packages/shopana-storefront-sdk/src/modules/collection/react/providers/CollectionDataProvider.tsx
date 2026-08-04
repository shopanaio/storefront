'use client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import { CollectionDataContext } from '../context/CollectionDataContext';
import type {
  CollectionTemplateData,
  Collection,
  CollectionListing,
  CollectionProduct,
  CollectionFilter,
  CollectionImage,
} from '../../core/types';
import type {
  SdkCollectionListingFragment,
  SdkCollectionProductCardFragment,
  SdkCollectionQuery,
  SdkCollectionQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
interface CollectionDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializableApolloQuery<
    SdkCollectionQuery,
    SdkCollectionQueryVariables
  >;
}
type RawFilter = SdkCollectionListingFragment['listing']['filters'][number];
type RawPriceRange = NonNullable<RawFilter['priceRange']>;
const toMoney = (money: RawPriceRange['min']) => ({
  amount: String(money.amount),
  currencyCode: money.currencyCode,
});
function transformFilter(rawFilter: RawFilter): CollectionFilter {
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
const toImage = (media: unknown): CollectionImage | null => {
  if (!media || typeof media !== 'object') return null;
  const candidate = media as {
    readonly id?: string;
    readonly image?: { readonly url?: unknown } | null;
  };
  return candidate.id && candidate.image?.url
    ? { id: candidate.id, url: String(candidate.image.url) }
    : null;
};
function transformProduct(
  rawProduct: SdkCollectionProductCardFragment
): CollectionProduct {
  const selectedVariant = rawProduct.selectedVariant;
  const seen = new Set<string>();
  const gallery = [
    toImage(rawProduct.cover),
    ...rawProduct.gallery.edges.map((edge) => toImage(edge.node)),
  ].filter((image): image is CollectionImage => {
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
              color: value.swatch.color ? String(value.swatch.color) : null,
              color2: value.swatch.color2 ? String(value.swatch.color2) : null,
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
function transformListing(
  rawListing: SdkCollectionListingFragment['listing'] | undefined
): CollectionListing | null {
  if (!rawListing) {
    return null;
  }
  return {
    totalCount: rawListing.totalCount,
    filters: rawListing.filters.map(transformFilter),
    pageInfo: {
      hasNextPage: rawListing.pageInfo.hasNextPage,
      endCursor: rawListing.pageInfo.endCursor,
    },
    products: rawListing.edges.map((edge) => transformProduct(edge.node)),
  };
}
function transformCollection(
  rawCategory: SdkCollectionQuery['category'],
  listingData: SdkCollectionListingFragment | null
): Collection | null {
  if (!rawCategory) {
    return null;
  }
  return {
    id: rawCategory.id,
    title: rawCategory.title,
    handle: rawCategory.handle,
    description: rawCategory.description?.text ?? null,
    listing: transformListing(listingData?.listing),
  };
}
function transformQueryData(
  data: SdkCollectionQuery,
  listingData: SdkCollectionListingFragment | null
): CollectionTemplateData {
  return {
    pageType: 'collection',
    raw: data,
    collection: transformCollection(data.category, listingData),
  };
}
export function CollectionDataProvider({
  children,
  preloadedQuery,
}: CollectionDataProviderProps) {
  const rawData = preloadedQuery.data;
  const listingData = rawData.category;
  const data = useMemo(
    () => transformQueryData(rawData, listingData ?? null),
    [rawData, listingData]
  );
  return (
    <CollectionDataContext.Provider value={{ data }}>
      {children}
    </CollectionDataContext.Provider>
  );
}
