import { useListingProductCardFragment_product$key } from '@src/templates/collection/relay/__generated__/useListingProductCardFragment_product.graphql';
import useListingProductCardFragment from '@src/templates/collection/relay';
import {
  ProductCardProps,
  ProductCard,
} from '@src/ui-kit/ProductCards/ListingCard/ProductCard';
import { composeProductTitle } from '@src/utils/composeProductTitle';
import type { model } from "@shopana/storefront-sdk";
import { CurrencyCode } from '@codegen/schema-client';

import { useIsInTheCart, useAddItemToCart } from '@src/hooks/cart';
import { useProductSwatches } from '@src/hooks/useProductSwatches';
import { useReviewStore } from '@src/store/appStore';
import { Money } from '@src/ui-kit/Price/Price';

interface CommonProductData {
  id: string;
  title: string;
  handle: string;
  rating?: {
    rating: number;
    count: number;
  };
  cover?: {
    url: string;
  } | null;
  gallery?: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  } | null;
  stockStatus?: {
    isAvailable: boolean;
  };
  price?: Money;
  compareAtPrice?: Money | null;
  options?: model.ProductOption[];
  variants?:
    | model.ProductVariant[]
    | {
        edges: Array<{
          node: model.Product;
        }>;
      };
}

type ProductCardRelayProps = Omit<ProductCardProps, 'product'> & {
  $productRef: useListingProductCardFragment_product$key;
};

export const ListingProductCardRelay = ({
  $productRef,
  ...props
}: ProductCardRelayProps) => {
  // @ts-expect-error don't fix this
  const product = useListingProductCardFragment(
    $productRef
  ) as CommonProductData;

  const { isInCart } = useIsInTheCart({
    purchasableId: product.id,
  });

  const { addToCart, isInFlight } = useAddItemToCart();

  // Safely get swatches with type checking
  const swatches = useProductSwatches(
    // Check that options exists and is array
    Array.isArray(product.options) ? product.options : [],
    // Check that variants exists and is array
    Array.isArray(product.variants) ? product.variants : [],
    product as model.ProductVariant
  );

  // Safely extract data with type checking
  const rating: model.ProductRating = {
    id: product.id,
    rating: product.rating?.rating || 0,
    count: product.rating?.count || 0,
    breakdown: [],
  };

  const gallery = product.gallery?.edges?.map((edge) => edge.node.url) || [];
  const productTitle = composeProductTitle({
    productTitle: (product as any)?.product?.title,
    variantTitle: product.title,
    fallback: product.title || '',
  });
  const handle = (product as any)?.product?.handle || product.handle || '';
  const variantHandle =
    (product as any)?.variantHandle || product.handle || undefined;
  const isAvailable = product.stockStatus?.isAvailable || false;
  const price = product.price || {
    amount: 0,
    currencyCode: CurrencyCode.Usd,
  };

  const compareAtPrice = product.compareAtPrice
    ? ({ ...product.compareAtPrice } as any)
    : undefined;
  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);

  return (
    <ProductCard
      {...props}
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
            purchasableSnapshot: product as model.ProductVariant,
            quantity: 1,
          });
        }
      }}
      onReviewClick={() => setReviewProduct(product as model.Product)}
    />
  );
};
