import { useListingProductCardFragment_product$key } from "@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql";
import useListingProductCardFragment from "@src/components/Listing/relay";
import {
  ProductCardProps,
  ProductCard,
} from "@src/components/UI/ProductCards/ListingCard/ProductCard";
import type * as Entity from "@src/entity/namespace";
import { CurrencyCode } from "@codegen/schema-client";

import useIsInTheCart from "@src/hooks/cart/useIsInTheCart";
import useAddItemToCart from "@src/hooks/cart/useAddItemToCart";
import { useProductSwatches } from "@src/hooks/useProductSwatches";
import { useReviewStore } from "@src/store/appStore";
import { Money } from "@src/components/UI/Price/Price";
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
  options?: ApiProductOption[];
  variants?:
    | ApiProductVariant[]
    | {
        edges: Array<{
          node: ApiProduct;
        }>;
      };
}

type ProductCardRelayProps = Omit<ProductCardProps, "product"> & {
  $productRef: useListingProductCardFragment_product$key;
};

export const ListingProductCardRelay = ({
  $productRef,
  ...props
}: ProductCardRelayProps) => {
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
    product as Entity.ProductVariant
  );

  // Safely extract data with type checking
  const rating: Entity.ProductRating = {
    id: product.id,
    iid: product.id,
    rating: product.rating?.rating || 0,
    count: product.rating?.count || 0,
    breakdown: [],
  };

  const gallery = product.gallery?.edges?.map((edge) => edge.node.url) || [];
  const productTitle = product.title || "";
  const handle = (product as any)?.product?.handle || product.handle || "";
  const variantHandle = (product as any)?.variantHandle || product.handle || undefined;
  const isAvailable = product.stockStatus?.isAvailable || false;
  const price = product.price || {
    amount: "0.00",
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
            quantity: 1,
          });
        }
      }}
      onReviewClick={() => setReviewProduct(product as ApiProduct)}
    />
  );
};
