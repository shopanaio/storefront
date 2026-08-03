'use client';

import { readInlineData } from 'react-relay';
import CollectionProductCardFragmentNode, {
  CollectionProductCardFragment$key,
} from '@shopana/storefront-sdk/modules/collection/core/graphql/fragments/__generated__/CollectionProductCardFragment.graphql';
import {
  ProductCard,
} from '@src/ui-kit/ProductCards/ListingCard/ProductCard';
import { composeProductTitle } from '@src/utils/composeProductTitle';
import useIsInTheCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useIsInTheCart';
import useAddItemToCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useAddItemToCart';
import { useProductSwatches } from '@src/hooks/useProductSwatches';
import { useReviewStore } from '@src/store/appStore';
import { mapListingProductCard } from '@src/templates/collection/mappers/mapListingProductCard';

interface CollectionProductCardProps {
  $productRef: CollectionProductCardFragment$key;
}

export const CollectionProductCard = ({
  $productRef,
}: CollectionProductCardProps) => {
  const rawProduct = readInlineData(
    CollectionProductCardFragmentNode,
    $productRef
  );
  const { product, variant, gallery } = mapListingProductCard(rawProduct);

  const { isInCart } = useIsInTheCart({
    purchasableId: variant.id,
  });

  const { addToCart, isInFlight } = useAddItemToCart();

  // Safely get swatches with type checking
  const swatches = useProductSwatches(
    product.options,
    product.variants,
    variant
  );

  // Extract rating data
  const rating = product.rating;

  // Compose product title
  const productTitle = composeProductTitle({
    productTitle: product.title,
    variantTitle: variant.title,
    fallback: variant.title,
  });

  const handle = product.handle;
  const variantHandle = variant.handle || undefined;
  const isAvailable = variant.stockStatus.isAvailable;
  const price = variant.price;

  const compareAtPrice = variant.compareAtPrice
    ? { ...variant.compareAtPrice }
    : undefined;

  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);

  return (
    <ProductCard
      id={variant.id}
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
      compareAtPrice={compareAtPrice}
      isInCart={isInCart}
      isLoading={isInFlight}
      onAddToCart={() => {
        if (!isInCart) {
          addToCart({
            purchasableId: variant.id,
            purchasableSnapshot: variant,
            quantity: 1,
          });
        }
      }}
      onReviewClick={() => setReviewProduct(product)}
    />
  );
};
