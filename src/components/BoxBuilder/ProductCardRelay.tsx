import React from "react";
import { useFragment } from "react-relay";
import { ProductCard, ProductType } from "./ProductCard";
import { ProductCardRelay_product$key } from "../Listing/__generated__/ProductCardRelay_product.graphql";
import { ProductCardFragment } from "../Listing/ProductCard.fragment.shopana";
import { ApiProduct } from "@codegen/schema-client";

interface ProductCardRelayProps {
  product: ProductCardRelay_product$key;
  allowCount?: boolean;
  productType: ProductType;
}

export const ProductCardRelay: React.FC<ProductCardRelayProps> = (props) => {
  const productData = useFragment(ProductCardFragment, props.product);

  return (
    <ProductCard
      product={productData as unknown as ApiProduct}
      allowCount={!!props.allowCount}
      productType={props.productType}
    />
  );
};
