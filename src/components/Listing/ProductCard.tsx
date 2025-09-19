import { useListingProductCardFragment_product$key } from "@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql";
import useListingProductCardFragment from "@src/components/Listing/relay";
import {
  ProductCardProps,
  ProductCard,
} from "@src/components/UI/ProductCards/ListingCard/ProductCard";
import {
  ApiProductRating,
  ApiProduct,
  ApiProductOption,
} from "@codegen/schema-client";

import useIsInTheCart from "@src/hooks/cart/useIsInTheCart";
import useAddItemToCart from "@src/hooks/cart/useAddItemToCart";
import { useProductSwatches } from "@src/hooks/useProductSwatches";
import { useReviewStore } from "@src/store/appStore";
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
  price?: {
    amount: number;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: number;
    currencyCode: string;
  } | null;
  options?: ApiProductOption[];
  variants?:
    | ApiProduct[]
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

  // Add product existence check
  if (!product) {
    console.warn("Product is null or undefined in ListingProductCardRelay");
    return null;
  }

  const { isInCart } = useIsInTheCart({
    product: product as ApiProduct,
  });

  const { addToCart } = useAddItemToCart();

  // Safely get swatches with type checking
  const swatches = useProductSwatches(
    // Check that options exists and is array
    Array.isArray(product.options) ? product.options : [],
    // Check that variants exists and is array
    Array.isArray(product.variants) ? product.variants : [],
    product as ApiProduct
  );

  // Safely extract data with type checking
  const rating: ApiProductRating = {
    id: product.id,
    iid: product.id,
    rating: product.rating?.rating || 0,
    count: product.rating?.count || 0,
    breakdown: [],
  };

  const gallery = product.gallery?.edges?.map((edge) => edge.node.url) || [];
  const productTitle = product.title || "";
  const handle = product.handle || "";
  const isAvailable = product.stockStatus?.isAvailable || false;
  const price = product.price || { amount: 0, currencyCode: "USD" };
  const compareAtPrice = product.compareAtPrice || undefined;

  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);

  return (
    <ProductCard
      {...props}
      id={product.id}
      swatches={swatches}
      rating={{
        rating: rating.rating,
        ratingCount: rating.count,
      }}
      gallery={gallery}
      productTitle={productTitle}
      handle={handle}
      isAvailable={isAvailable}
      price={price}
      compareAtPrice={compareAtPrice}
      isInCart={isInCart}
      onAddToCart={() => {
        addToCart({
          product: product, // Pass entire object product
          quantity: 1,
        });
      }}
      onReviewClick={() => setReviewProduct(product as ApiProduct)}
    />
  );
};
