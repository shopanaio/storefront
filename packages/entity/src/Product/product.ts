import type { ProductVariant } from './variant';
import type { TagConnection } from '../Tag';
import type { ProductGroup } from './ProductGroup';
import type { Category } from '../Category';
import type { ProductOption } from './ProductOption';
import type { ProductFeature } from './ProductFeature';
import type { ProductRating } from './ProductRating';
import type { ReviewConnection } from '../Review';

/**
 * ProductFull interface - represents a complete product with all data
 * Product-level data (category, rating, options, groups, etc) + variants
 */
export interface Product {
  __typename?: 'Product';

  /** Global unique identifier */
  id: string;

  /** URL-friendly slug for product */
  handle: string;

  /** Product title */
  title: string;

  /** Full product description */
  description: string;

  /** Short description or product annotation */
  excerpt: string;

  /** Main product category */
  category?: Category | null;

  /**
   * All option groups defined for this product
   * Each group represents a configurable attribute
   * (e.g., color, size, material) and includes a complete set of possible values
   */
  options: Array<ProductOption>;

  /** Groups of related products (e.g., bundles) */
  groups: Array<ProductGroup>;

  /** Feature sections and their values */
  features: Array<ProductFeature>;

  /** Product rating */
  rating: ProductRating;

  /** Product reviews */
  reviews?: ReviewConnection;

  /** Tags associated with the product */
  tags: TagConnection;

  /** SEO description for the product page */
  seoDescription?: string | null;

  /** SEO title for the product page */
  seoTitle?: string | null;

  /** Product creation date and time */
  createdAt: string;

  /** Date and time of last product update */
  updatedAt: string;

  /** Product variants (different option combinations) */
  variants: Array<ProductVariant>;
}
