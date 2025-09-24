/* eslint-disable */
"use client";

import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { ApiCategory } from "@codegen/schema-client";
import { ProductSlideShowRelay_category$key } from "@src/components/Home/ProductSlideshow/relay/__generated__/ProductSlideShowRelay_category.graphql";

const ProductSlideShowFragment = graphql`
  fragment useProductSlideshowFragment_category on Category {
    id
    title
    handle
    listing(first: 12) {
      edges {
        node {
          ... on ProductVariant {
            ...useListingProductCardFragment_product
              @arguments(withOptions: false)
          }
        }
      }
    }
  }
`;

const useProductSlideShowFragment = (
  sources: readonly ProductSlideShowRelay_category$key[]
): ApiCategory[] => {
  const categories = sources.map((source) =>
    useFragment(ProductSlideShowFragment, source)
  );

  return categories as unknown as ApiCategory[];
};

export default useProductSlideShowFragment;
