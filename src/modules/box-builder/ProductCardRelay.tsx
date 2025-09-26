import React from "react";
import { useFragment } from "react-relay";
import { ProductCard, ProductType } from "./ProductCard";
import { ApiProduct } from "@codegen/schema-client";
import { UseProductCardFragment } from "@src/components/Listing/relay/useListingProductCardFragment.shopify";
import { useListingProductCardFragment_product$key } from "@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql";

interface ProductCardRelayProps {
  product: useListingProductCardFragment_product$key;
  allowCount?: boolean;
  productType: ProductType;
}

export const ProductCardRelay: React.FC<ProductCardRelayProps> = (props) => {
  const productData = useFragment(UseProductCardFragment, props.product);

  return (
    <ProductCard
      product={productData as unknown as ApiProduct}
      allowCount={!!props.allowCount}
      productType={props.productType}
    />
  );
};
