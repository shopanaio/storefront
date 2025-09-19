import { ApiPredictiveSearchResult, ListingSort, ListingType } from "@codegen/schema-client";
import { mockCategory } from "./category";
import { mockArticle } from "./article";
import { mockPage } from "./page";
import { mockProducts } from "./products";

export const mockSearch: ApiPredictiveSearchResult = {
  __typename: 'PredictiveSearchResult',

  articles: {
    __typename: 'ArticleConnection',
    edges: [{
      __typename: 'ArticleEdge',
      cursor: "1",
      node: mockArticle,
    }],
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 1,
  },

  categories: {
    __typename: 'CategoryConnection',
    edges: [{
      __typename: 'CategoryEdge',
      cursor: '1',
      node: mockCategory,
    }],
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    /** The total number of items. */
    totalCount: 1,
  },

  pages: {
    __typename: 'PageConnection',
    edges: [{
      __typename: 'PageEdge',
      cursor: "1",
      node: mockPage,
    }],
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 1,
  },

  products: {
    __typename: 'ListingConnection',
    appliedFacets: [], //Array<ApiFacet>

    appliedSort: ListingSort.CreatedAtAsc,
    defaultSort: ListingSort.CreatedAtAsc,
    edges: mockProducts.map((item, index) => ({
      __typename: "ListingEdge",
      cursor: `cursor-${index + 1}`,
      node: item,
    })),
    facets: [], //Array<ApiFacet>
    listingType: ListingType.Standard,
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: mockProducts.length,
  },
}
