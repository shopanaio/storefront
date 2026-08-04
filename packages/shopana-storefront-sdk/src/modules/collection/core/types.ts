import type {
  SdkCollectionListingFragment,
  SdkCollectionProductCardFragment,
  SdkCollectionQuery,
} from '../../../graphql/apollo/generated/operations';
export type CollectionQueryResponse = SdkCollectionQuery;
export type CollectionListingData = SdkCollectionListingFragment;
export type CollectionProductCardData = SdkCollectionProductCardFragment;
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
  input: unknown;
  selected: boolean;
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
  selectedOptions?: string[] | null;
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
export type CollectionListingFragmentReference = SdkCollectionListingFragment;
export type CollectionProductCardFragmentReference =
  SdkCollectionProductCardFragment;
