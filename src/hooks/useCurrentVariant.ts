import { useMemo } from 'react';
import type { Entity } from '@shopana/entity';

interface UseCurrentVariantProps {
  /** Base product entity with all data */
  product: Entity.Product;
  /** Selected variant handle from URL */
  variantHandle?: string;
}

interface CurrentVariantData {
  /** Combined title of the product and variant */
  title: string;
  /** Current variant or first variant if none selected */
  currentVariant: Entity.ProductVariant;
}

/**
 * Hook to prepare product and variant data for display.
 * Separates variant-specific data (title, price, images) from product-level data (rating, category, etc).
 *
 * @param product - Full product entity with variants
 * @param variantHandle - Handle of the selected variant from URL
 * @returns Prepared data for product display
 */
export function useCurrentVariant({
  product,
  variantHandle,
}: UseCurrentVariantProps): CurrentVariantData {
  if (!product) {
    throw new Error('Product not found');
  }

  const currentVariant = useMemo(() => {
    if (product.variants.length === 1) {
      return product.variants[0];
    }

    return (
      product.variants?.find((v) => v.handle === variantHandle) ||
      product.variants?.[0]
    );
  }, [product, variantHandle]);

  if (!currentVariant) {
    throw new Error("Product doesn't have any variants");
  }

  const title = `${product.title} ${currentVariant.title}`;

  return {
    title,
    currentVariant,
  };
}
