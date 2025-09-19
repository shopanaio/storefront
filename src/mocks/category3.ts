import { ApiCategory, ListingSort, ListingType, MediaSource } from "@codegen/schema-client";
import { mockProducts } from "./products";
import { mockCategoryEdges2 } from "./CategoryList/CategoriesEdges2";

export const mockCategory3: ApiCategory = {
  id: "1",
  iid: "uuid-1",
  __typename: "Category",
  breadcrumbs: [],
  categoryType: null,
  children: {
    __typename: "CategoryConnection",
    edges: mockCategoryEdges2,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 0,
  },
  cover: null,
  createdAt: new Date().toISOString(),
  description: "",
  excerpt: "",
  gallery: {
    __typename: "GalleryConnection",
    edges: [
      {
        __typename: "GalleryEdge",
        cursor: "cursor-1",
        node: {
          __typename: "File",
          id: "file-1",
          iid: "uuid-file-1",
          source: MediaSource.Url,
          url: "https://example.com/image1.jpg",
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 0,
  },
  handle: "toy-category",
  listing: {
    __typename: "ListingConnection",
    appliedFacets: [],
    appliedSort: ListingSort.CreatedAtAsc,
    defaultSort: ListingSort.CreatedAtAsc,
    edges: mockProducts.map((product, index) => ({
      __typename: 'ListingEdge',
      cursor: `cursor-${index + 1}`,
      node: product,
    })),
    facets: [],
    listingType: ListingType.Standard,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: mockProducts.length,
  },
  seoDescription: null,
  seoTitle: null,
  title: "Toy 3",
  updatedAt: new Date().toISOString(),
}
