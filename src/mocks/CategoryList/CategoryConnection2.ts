import { ApiCategoryConnection } from "@codegen/schema-client";
import { mockCategoryEdges2 } from "./CategoriesEdges2";

export const mockCategoryConnection: ApiCategoryConnection = {
  __typename: 'CategoryConnection',
  edges: mockCategoryEdges2,
  pageInfo: {
    __typename: "PageInfo",
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: "cursor-1",
    endCursor: "cursor-1",
  },
  totalCount: 10,
};
