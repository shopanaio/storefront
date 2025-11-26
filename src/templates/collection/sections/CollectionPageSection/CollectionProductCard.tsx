'use client';

import { useFragment } from 'react-relay';
import CollectionProductCardFragmentNode, {
  CollectionProductCardFragment$key,
  CollectionProductCardFragment$data,
} from '@shopana/storefront-sdk/modules/collection/core/graphql/fragments/__generated__/CollectionProductCardFragment.graphql';
import {
  ProductCard,
} from '@src/ui-kit/ProductCards/ListingCard/ProductCard';
import { composeProductTitle } from '@src/utils/composeProductTitle';
import type { model } from '@shopana/storefront-sdk';
import { CurrencyCode } from '@codegen/schema-client';
import { useIsInTheCart, useAddItemToCart } from '@src/hooks/cart';
import { useProductSwatches } from '@src/hooks/useProductSwatches';
import { useReviewStore } from '@src/store/appStore';

interface CollectionProductCardProps {
  $productRef: CollectionProductCardFragment$key;
}

export const CollectionProductCard = ({
  $productRef,
}: CollectionProductCardProps) => {
  const product = useFragment<CollectionProductCardFragment$key>(
    CollectionProductCardFragmentNode,
    $productRef
  ) as CollectionProductCardFragment$data;

  const { isInCart } = useIsInTheCart({
    purchasableId: product.id,
  });

  const { addToCart, isInFlight } = useAddItemToCart();

  // Safely get swatches with type checking
  const swatches = useProductSwatches(
    Array.isArray(product.options) ? (product.options as model.ProductOption[]) : [],
    [], // No variants in listing cards
    product as unknown as model.ProductVariant
  );

  // Extract rating data
  const rating = {
    rating: product.rating?.rating || 0,
    count: product.rating?.count || 0,
  };

  // Extract gallery URLs
  const gallery = product.gallery?.edges?.map((edge) => edge.node.url) || [];

  // Compose product title
  const productTitle = composeProductTitle({
    productTitle: product.product?.title,
    variantTitle: product.title,
    fallback: product.title || '',
  });

  const handle = product.product?.handle || product.handle || '';
  const variantHandle = product.handle || undefined;
  const isAvailable = product.stockStatus?.isAvailable || false;
  const price = product.price || {
    amount: 0,
    currencyCode: CurrencyCode.Usd,
  };

  const compareAtPrice = product.compareAtPrice
    ? { ...product.compareAtPrice }
    : undefined;

  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);

  return (
    <ProductCard
      id={product.id}
      swatches={swatches}
      rating={{
        rating: rating.rating,
        ratingCount: rating.count,
        compact: true,
      }}
      gallery={gallery}
      productTitle={productTitle}
      handle={handle}
      variantHandle={variantHandle}
      isAvailable={isAvailable}
      price={price}
      compareAtPrice={compareAtPrice as any}
      isInCart={isInCart}
      isLoading={isInFlight}
      onAddToCart={() => {
        if (!isInCart) {
          addToCart({
            purchasableId: product.id,
            purchasableSnapshot: product as unknown as model.ProductVariant,
            quantity: 1,
          });
        }
      }}
      onReviewClick={() => setReviewProduct(product as unknown as model.Product)}
    />
  );
};
