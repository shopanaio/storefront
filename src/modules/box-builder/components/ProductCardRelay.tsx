import React from 'react';
import { useFragment } from 'react-relay';
import { ProductCard, ProductType } from './ProductCard';
import type { Entity } from '@shopana/entity';
import UseProductCardFragment from '@src/components/Listing/relay';
import { useListingProductCardFragment_product$key } from '@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql';

interface ProductCardRelayProps {
  product: useListingProductCardFragment_product$key;
  allowCount?: boolean;
  productType: ProductType;
}

export const ProductCardRelay: React.FC<ProductCardRelayProps> = (props) => {
  // @ts-expect-error don't fix this
  const productData = useFragment(UseProductCardFragment, props.product);

  return (
    <ProductCard
      // @ts-expect-error don't fix this
      product={productData as unknown as Entity.Product}
      allowCount={!!props.allowCount}
      productType={props.productType}
    />
  );
};
