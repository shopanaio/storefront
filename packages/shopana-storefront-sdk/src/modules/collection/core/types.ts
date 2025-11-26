import type { CollectionQuery$data } from './graphql/queries/__generated__/CollectionQuery.graphql';
import type { CollectionListingFragment$data } from './graphql/fragments/__generated__/CollectionListingFragment.graphql';
import type { CollectionProductCardFragment$data } from './graphql/fragments/__generated__/CollectionProductCardFragment.graphql';

export type CollectionQueryResponse = CollectionQuery$data;
export type CollectionListingData = CollectionListingFragment$data;
export type CollectionProductCardData = CollectionProductCardFragment$data;

export interface CollectionMoney {
  amount: string;
  currencyCode: string;
}

export interface CollectionImage {
  id: string;
  url: string;
}

export interface CollectionProductRating {
  rating: number;
  count: number;
}

export interface CollectionFilterValue {
  id: string;
  iid: string;
  handle: string;
  title: string;
  count: number;
}

export interface CollectionFilter {
  id: string;
  iid: string;
  handle: string;
  title: string;
  type: 'price_range' | 'rating_range' | 'list';
  minPrice?: CollectionMoney | null;
  maxPrice?: CollectionMoney | null;
  minRate?: number | null;
  maxRate?: number | null;
  values?: CollectionFilterValue[] | null;
}

export interface CollectionProductSwatch {
  id: string;
  color?: string | null;
  color2?: string | null;
  image?: CollectionImage | null;
  displayType?: string | null;
}

export interface CollectionProductOptionValue {
  id: string;
  title: string;
  handle: string;
  swatch?: CollectionProductSwatch | null;
}

export interface CollectionProductOption {
  id: string;
  handle: string;
  title: string;
  displayType?: string | null;
  values: CollectionProductOptionValue[];
}

export interface CollectionProduct {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  product: {
    id: string;
    handle: string;
    title: string;
  };
  rating?: CollectionProductRating | null;
  cover?: CollectionImage | null;
  gallery: CollectionImage[];
  price: CollectionMoney;
  compareAtPrice?: CollectionMoney | null;
  stockStatus?: {
    handle?: string | null;
    isAvailable: boolean;
  } | null;
  options: CollectionProductOption[];
  selectedOptions?: Record<string, string> | null;
}

export interface CollectionPageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface CollectionListing {
  totalCount: number;
  filters: CollectionFilter[];
  pageInfo: CollectionPageInfo;
  products: CollectionProduct[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  listing: CollectionListing | null;
}

export interface CollectionTemplateData {
  pageType: 'collection';
  raw: CollectionQueryResponse;
  collection: Collection | null;
}

export type { CollectionListingFragment$key } from './graphql/fragments/__generated__/CollectionListingFragment.graphql';
export type { CollectionProductCardFragment$key } from './graphql/fragments/__generated__/CollectionProductCardFragment.graphql';
