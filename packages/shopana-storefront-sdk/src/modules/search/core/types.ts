import type {
  SdkSearchProductCardFragment,
  SdkSearchProductsFragment,
  SdkSearchQuery,
} from '../../../graphql/apollo/generated/operations';
export type SearchQueryResponse = SdkSearchQuery;
export type SearchProductsData = SdkSearchProductsFragment;
export type SearchProductCardData = SdkSearchProductCardFragment;
export interface SearchMoney {
  amount: string;
  currencyCode: string;
}
export interface SearchImage {
  id: string;
  url: string;
}
export interface SearchProductRating {
  rating: number;
  count: number;
}
export interface SearchFilterValue {
  id: string;
  iid: string;
  handle: string;
  title: string;
  count: number;
  input: unknown;
  selected: boolean;
}
export interface SearchFilter {
  id: string;
  iid: string;
  handle: string;
  title: string;
  type: 'price_range' | 'rating_range' | 'list';
  minPrice?: SearchMoney | null;
  maxPrice?: SearchMoney | null;
  minRate?: number | null;
  maxRate?: number | null;
  values?: SearchFilterValue[] | null;
}
export interface SearchProductSwatch {
  id: string;
  color?: string | null;
  color2?: string | null;
  image?: SearchImage | null;
  displayType?: string | null;
}
export interface SearchProductOptionValue {
  id: string;
  title: string;
  handle: string;
  swatch?: SearchProductSwatch | null;
}
export interface SearchProductOption {
  id: string;
  handle: string;
  title: string;
  displayType?: string | null;
  values: SearchProductOptionValue[];
}
export interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  product: {
    id: string;
    handle: string;
    title: string;
  };
  rating?: SearchProductRating | null;
  cover?: SearchImage | null;
  gallery: SearchImage[];
  price: SearchMoney;
  compareAtPrice?: SearchMoney | null;
  stockStatus?: {
    handle?: string | null;
    isAvailable: boolean;
  } | null;
  options: SearchProductOption[];
  selectedOptions?: string[] | null;
}
export interface SearchPageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}
export interface SearchResults {
  totalCount: number;
  filters: SearchFilter[];
  pageInfo: SearchPageInfo;
  products: SearchProduct[];
}
export interface SearchTemplateData {
  pageType: 'search';
  raw: SearchQueryResponse;
  query: string;
  results: SearchResults | null;
}
export type SearchProductsFragmentReference = SdkSearchProductsFragment;
export type SearchProductCardFragmentReference = SdkSearchProductCardFragment;
