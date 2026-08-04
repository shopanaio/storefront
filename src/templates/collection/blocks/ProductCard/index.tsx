import type { StorefrontUseListingProductCardFragment_ProductFragment } from '../../../../../codegen/apollo/storefront-operations';
import useListingProductCardFragment from '@src/templates/collection/apollo';
import {
  type ProductCardProps,
  ProductCard,
} from '@src/ui-kit/ProductCards/ListingCard/ProductCard';
import { composeProductTitle } from '@src/utils/composeProductTitle';
import type { model } from '@shopana/storefront-sdk';
import type { SearchProduct } from '@shopana/storefront-sdk/modules/search/core/types';
import useIsInTheCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useIsInTheCart';
import useAddItemToCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useAddItemToCart';
import { useProductSwatches } from '@src/hooks/useProductSwatches';
import { useReviewStore } from '@src/store/appStore';
import { mapListingProductCard } from '@src/templates/collection/mappers/mapListingProductCard';
type ListingProductCardProps = Partial<Omit<ProductCardProps, 'product'>> &
  (
    | {
        productRef: StorefrontUseListingProductCardFragment_ProductFragment;
        product?: never;
      }
    | {
        productRef?: never;
        product: SearchProduct;
      }
  );
const mapSearchProduct = (product: SearchProduct) => {
  const productReference: model.Product = {
    __typename: 'Product',
    id: product.product.id,
    handle: product.product.handle,
    title: product.product.title,
    description: product.description ?? '',
    excerpt: '',
    category: null,
    options: product.options.map((option) => ({
      ...option,
      displayType:
        option.displayType === 'BUTTONS'
          ? 'RADIO'
          : (option.displayType as model.ProductOptionDisplayType),
      values: option.values.map((value) => ({
        ...value,
        swatch: value.swatch
          ? {
              ...value.swatch,
              color: value.swatch.color ?? '',
              displayType:
                value.swatch.displayType === 'GRADIENT'
                  ? 'COLOR_DUO'
                  : (value.swatch.displayType as model.SwatchDisplayType),
            }
          : null,
      })),
    })),
    groups: [],
    features: [],
    rating: {
      id: product.product.id,
      rating: product.rating?.rating ?? 0,
      count: product.rating?.count ?? 0,
      breakdown: [],
    },
    tags: {
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: 0,
    },
    createdAt: '',
    updatedAt: '',
    variants: [],
  };
  const images = product.gallery.map((image) => ({ ...image }));
  const variant: model.ProductVariant = {
    __typename: 'ProductVariant',
    id: product.id,
    iid: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? '',
    excerpt: '',
    selectedOptions: product.selectedOptions ?? [],
    price: {
      amount: Number(product.price.amount),
      currencyCode: product.price.currencyCode,
    },
    compareAtPrice: product.compareAtPrice
      ? {
          amount: Number(product.compareAtPrice.amount),
          currencyCode: product.compareAtPrice.currencyCode,
        }
      : null,
    cover: product.cover ?? images[0] ?? null,
    gallery: {
      edges: images.map((node) => ({ node, cursor: '' })),
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: images.length,
    },
    sku: null,
    stockStatus: { isAvailable: product.stockStatus?.isAvailable ?? false },
    createdAt: '',
    updatedAt: '',
    product: productReference,
  };
  return {
    product: { ...productReference, variants: [variant] },
    variant,
    gallery: images.map((image) => image.url),
  };
};
export const ListingProductCard = ({
  productRef,
  product: mappedProduct,
  ...props
}: ListingProductCardProps) => {
  const rawProduct = useListingProductCardFragment(productRef ?? null);
  const { product, variant, gallery } = mappedProduct
    ? mapSearchProduct(mappedProduct)
    : mapListingProductCard(rawProduct!);
  const { isInCart } = useIsInTheCart({ purchasableId: variant.id });
  const { addToCart, isInFlight } = useAddItemToCart();
  const swatches = useProductSwatches(
    product.options,
    product.variants,
    variant
  );
  const productTitle = composeProductTitle({
    productTitle: product.title,
    variantTitle: variant.title,
    fallback: variant.title,
  });
  const setReviewProduct = useReviewStore((state) => state.setReviewProduct);
  return (
    <ProductCard
      {...props}
      id={variant.id}
      swatches={swatches}
      rating={{
        rating: product.rating.rating,
        ratingCount: product.rating.count,
        compact: true,
      }}
      gallery={gallery}
      productTitle={productTitle}
      handle={product.handle}
      variantHandle={variant.handle || undefined}
      isAvailable={variant.stockStatus.isAvailable}
      price={variant.price}
      compareAtPrice={variant.compareAtPrice ?? undefined}
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
