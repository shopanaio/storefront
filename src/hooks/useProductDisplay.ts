import { useMemo } from 'react';
import { ApiProduct, ApiProductVariant } from '@codegen/schema-client';

interface UseProductDisplayProps {
  /** Base product entity with all data */
  product: ApiProduct;
  /** Selected variant handle from URL */
  selectedVariantHandle?: string;
}

interface ProductDisplayData {
  /** Current variant or first variant if none selected */
  currentVariant: ApiProductVariant;
  /** Title to display (from variant) */
  title: string;
  /** Price to display (from variant) */
  price: ApiProductVariant['price'];
  /** Compare at price to display (from variant) */
  compareAtPrice: ApiProductVariant['compareAtPrice'];
  /** Cover image to display (from variant) */
  cover: ApiProductVariant['cover'] | null;
  /** Gallery to display (from variant) */
  gallery: any; // TODO: Define proper gallery type
  /** Stock status (from variant) */
  stockStatus: ApiProductVariant['stockStatus'];
  /** SKU (from variant) */
  sku: ApiProductVariant['sku'];
  /** Product-level data that doesn't change with variant */
  productData: {
    id: string;
    handle: string;
    description: string;
    excerpt: string;
    rating: ApiProduct['rating'];
    category: ApiProduct['category'];
    options: ApiProduct['options'];
    groups: ApiProduct['groups'];
    features: ApiProduct['features'];
    tags: ApiProduct['tags'];
  };
}

/**
 * Hook to prepare product and variant data for display.
 * Separates variant-specific data (title, price, images) from product-level data (rating, category, etc).
 *
 * @param product - Full product entity with variants
 * @param selectedVariantHandle - Handle of the selected variant from URL
 * @returns Prepared data for product display
 */
export function useProductDisplay({
  product,
  selectedVariantHandle,
}: UseProductDisplayProps): ProductDisplayData {
  const currentVariant = useMemo(() => {
    // Find variant by handle or use first variant
    const found = product.variants?.find((v) => v.handle === selectedVariantHandle);
    return found || product.variants?.[0]; // Must have at least one variant
  }, [product, selectedVariantHandle]);

  return useMemo(() => {
    // Extract variant-specific data
    const variantData = {
      currentVariant,
      title: currentVariant.title,
      price: currentVariant.price,
      compareAtPrice: currentVariant.compareAtPrice || null,
      cover: currentVariant.cover || null,
      // Use variant gallery
      gallery: (currentVariant as any).gallery,
      stockStatus: currentVariant.stockStatus,
      sku: currentVariant.sku || null,
    };

    // Product-level data that doesn't change with variant
    const productData = {
      id: product.id,
      handle: product.handle,
      description: product.description,
      excerpt: product.excerpt,
      rating: product.rating,
      category: product.category,
      options: product.options,
      groups: product.groups,
      features: product.features,
      tags: product.tags,
    };

    return {
      ...variantData,
      productData,
    };
  }, [currentVariant, product]);
}
