'use client';

import type { HomeProduct } from '@shopana/storefront-sdk/modules/home/core/types';
import type { model } from '@shopana/storefront-sdk';
import { ProductCard } from '@src/ui-kit/ProductCards/ListingCard/ProductCard';
import { CurrencyCode } from '@codegen/schema-client';
import { composeProductTitle } from '@src/utils/composeProductTitle';
import useIsInTheCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useIsInTheCart';
import useAddItemToCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useAddItemToCart';
import { useReviewStore } from '@src/store/appStore';

interface Props {
  product: HomeProduct;
}

export function HomeSlideshowProductCard({ product }: Props) {
  const price = {
    amount: Number(product.price.amount),
    currencyCode: product.price.currencyCode as CurrencyCode,
  };

  const compareAtPrice = product.compareAtPrice
    ? {
        amount: Number(product.compareAtPrice.amount),
        currencyCode: product.compareAtPrice.currencyCode as CurrencyCode,
      }
    : undefined;

  const gallery = product.image?.url ? [product.image.url] : [];
  const cover = product.image?.url
    ? { id: `${product.id}:cover`, url: product.image.url }
    : null;
  const variant: model.ProductVariant = {
    __typename: 'ProductVariant',
    id: product.id,
    iid: product.id,
    title: product.title,
    handle: product.handle,
    description: '',
    excerpt: '',
    selectedOptions: [],
    price,
    compareAtPrice: compareAtPrice ?? null,
    cover,
    gallery: {
      edges: cover ? [{ node: cover, cursor: '' }] : [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: cover ? 1 : 0,
    },
    sku: null,
    stockStatus: { isAvailable: true },
    createdAt: '',
    updatedAt: '',
  };
  const reviewProduct: model.Product = {
    __typename: 'Product',
    id: product.product.id,
    title: product.product.title,
    handle: product.product.handle,
    description: '',
    excerpt: '',
    category: null,
    options: [],
    groups: [],
    features: [],
    rating: { id: product.product.id, rating: 0, count: 0, breakdown: [] },
    tags: {
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: 0,
    },
    createdAt: '',
    updatedAt: '',
    variants: [variant],
  };

  const productTitle = composeProductTitle({
    productTitle: product.product.title,
    variantTitle: product.title,
    fallback: product.title || '',
  });

  const { isInCart } = useIsInTheCart({
    purchasableId: product.id,
  });

  const { addToCart, isInFlight } = useAddItemToCart();
  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);

  return (
    <ProductCard
      id={product.id}
      productTitle={productTitle}
      handle={product.product.handle}
      variantHandle={product.handle}
      title={{ rows: 1, size: 'default' }}
      rating={{ rating: 0, ratingCount: 0, compact: true }}
      isAvailable={true}
      price={price}
      compareAtPrice={compareAtPrice}
      gallery={gallery}
      isInCart={isInCart}
      isLoading={isInFlight}
      onAddToCart={() => {
        if (!isInCart) {
          addToCart({
            purchasableId: product.id,
            purchasableSnapshot: variant,
            quantity: 1,
          });
        }
      }}
      onReviewClick={() => setReviewProduct(reviewProduct)}
    />
  );
}
