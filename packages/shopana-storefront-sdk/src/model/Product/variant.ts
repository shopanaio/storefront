import type { Money } from '../Money';
import type { Media } from '../Media';
import type { Connection } from '../Connection';
import type { Product } from './product';

/**
 * StockStatus - product availability information
 */
export interface StockStatus {
  /** Whether the item is available for purchase */
  isAvailable: boolean;
}

/**
 * GalleryConnection - paginated collection of gallery images
 */
export type GalleryConnection = Connection<Media>;

/**
 * ProductVariant interface - represents a specific variant of a product
 * Contains variant-specific fields like price, images, stock status
 */
export interface ProductVariant {
  __typename?: 'ProductVariant';

  /** Global unique identifier */
  id: string;

  /** Internal object identifier */
  iid: string;

  /** URL-friendly slug for variant */
  handle: string;

  /** Variant title */
  title: string;

  /** Full variant description */
  description: string;

  /** Short description or variant annotation */
  excerpt: string;

  /**
   * Ordered list of value handles applied to this variant configuration
   * Each entry is a handle of the selected ProductOptionValue (e.g., ["red", "m", "patterned"])
   */
  selectedOptions: string[];

  /** Current variant price, including currency */
  price: Money;

  /** Original price during sale */
  compareAtPrice?: Money | null;

  /** Main variant image */
  cover?: Media | null;

  /** Gallery of variant images */
  gallery?: GalleryConnection;

  /** Stock keeping unit identifier */
  sku?: string | null;

  /** Item availability information */
  stockStatus: StockStatus;

  /** Variant creation date and time */
  createdAt: string;

  /** Date and time of last variant update */
  updatedAt: string;

  /** Product associated with the variant */
  product?: Product | null;
}
