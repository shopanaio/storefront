import type {
  SdkCategoryFragment_CategoryFragment,
  SdkHomePageQuery,
} from '../../../graphql/apollo/generated/operations';
export type CategoryData = SdkCategoryFragment_CategoryFragment;
export type HomeQueryResponse = SdkHomePageQuery;
export interface HomeProduct {
  id: string;
  title: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  image?: {
    url: string;
    source?: string | null;
  } | null;
  product: {
    id: string;
    title: string;
    handle: string;
  };
}
export interface HomeCategory {
  id: string;
  title: string;
  handle: string;
  products: HomeProduct[];
}
export interface HomeTemplateData {
  pageType: 'home';
  raw: HomeQueryResponse;
  categories: {
    electronics: HomeCategory | null;
    toys: HomeCategory | null;
    sport: HomeCategory | null;
    homeAndGarden: {
      id: string;
      title: string;
      handle: string;
      children: HomeCategory[];
    } | null;
  };
}
export type CategoryFragmentReference = SdkCategoryFragment_CategoryFragment;
