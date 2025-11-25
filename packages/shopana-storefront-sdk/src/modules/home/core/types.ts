import type { CategoryFragment_category$data } from './graphql/fragments/__generated__/CategoryFragment_category.graphql';
import type { HomePageQuery$data } from './graphql/queries/__generated__/HomePageQuery.graphql';

export type CategoryData = CategoryFragment_category$data;
export type HomeQueryResponse = HomePageQuery$data;

export interface HomeProduct {
  id: string;
  title: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?:
    | {
        amount: string;
        currencyCode: string;
      }
    | null;
  image?:
    | {
        url: string;
        source?: string | null;
      }
    | null;
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
    homeAndGarden:
      | {
          id: string;
          title: string;
          handle: string;
          children: HomeCategory[];
        }
      | null;
  };
}

export type { CategoryFragment_category$key } from './graphql/fragments/__generated__/CategoryFragment_category.graphql';
