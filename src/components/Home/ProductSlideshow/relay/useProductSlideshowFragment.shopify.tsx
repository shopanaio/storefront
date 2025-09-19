"use client";

import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { ApiCategory } from "@codegen/schema-client";
import { ProductSlideShowRelayShopify_category$key } from "@src/components/Home/ProductSlideshow/relay/__generated__/ProductSlideShowRelayShopify_category.graphql";

const ProductSlideShowFragment = graphql`
  fragment useProductSlideshowFragment_category on Collection {
    id
    title
    handle
    products(first: 12) {
      edges {
        node {
          ... on Product {
            ...useListingProductCardFragment_product
          }
        }
      }
    }
  }
`;

// Function for converting Shopify Collection to ApiCategory
const transformShopifyCollectionToApiCategory = (
  collection: any
): ApiCategory => {
  return {
    __typename: "Category",
    id: collection.id,
    iid: collection.id, // Use id as iid for Shopify
    title: collection.title,
    handle: collection.handle,
    description: "", // Shopify doesn't provide description in this fragment
    excerpt: "",
    listingType: "STANDARD" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    breadcrumbs: [],
    children: {
      __typename: "CategoryConnection",
      edges: [],
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    },
    gallery: {
      __typename: "GalleryConnection",
      edges: [],
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    },
    listing: {
      __typename: "ListingConnection",
      edges: collection.products.edges,
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: collection.products.edges.length,
    },
    cover: null,
    seoTitle: null,
    seoDescription: null,
  };
};

const useProductSlideShowFragment = (
  sources: ProductSlideShowRelayShopify_category$key[]
): ApiCategory[] => {
  const collections = sources.map((source) =>
    useFragment(ProductSlideShowFragment, source)
  );

  const categories: ApiCategory[] = collections.map(
    transformShopifyCollectionToApiCategory
  );

  return categories;
};

export default useProductSlideShowFragment;
