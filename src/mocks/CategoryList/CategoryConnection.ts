import { ApiCategoryConnection } from "@codegen/schema-client";
import { mockCategoryEdges } from "./CategoriesEdges";

export const mockCategoryConnection: ApiCategoryConnection = {
  __typename: 'CategoryConnection',
  edges: mockCategoryEdges,
  pageInfo: {
    __typename: "PageInfo",
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: "cursor-1",
    endCursor: "cursor-1",
  },
  totalCount: 10,
};
