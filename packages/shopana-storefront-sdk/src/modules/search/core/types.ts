import type { SearchQuery$data } from './graphql/queries/__generated__/SearchQuery.graphql';
import type { SearchProductsFragment$data } from './graphql/fragments/__generated__/SearchProductsFragment.graphql';
import type { SearchProductCardFragment$data } from './graphql/fragments/__generated__/SearchProductCardFragment.graphql';

export type SearchQueryResponse = SearchQuery$data;
export type SearchProductsData = SearchProductsFragment$data;
export type SearchProductCardData = SearchProductCardFragment$data;

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
  selectedOptions?: Record<string, string> | null;
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

export type { SearchProductsFragment$key } from './graphql/fragments/__generated__/SearchProductsFragment.graphql';
export type { SearchProductCardFragment$key } from './graphql/fragments/__generated__/SearchProductCardFragment.graphql';
