import type { Media } from '../Media';
import type { Swatch } from './ProductSwatch';

/**
 * ProductOptionDisplayType - how option is displayed in UI
 */
export type ProductOptionDisplayType =
  | 'SWATCH'
  | 'VARIANT_COVER'
  | 'RADIO'
  | 'DROPDOWN'
  | 'APPAREL_SIZE';

/**
 * ProductOptionValue - single value for a product option
 */
export interface ProductOptionValue {
  /** Global unique identifier */
  id: string;
  /** Display name */
  title: string;
  /** URL-friendly handle */
  handle: string;
  /** Optional swatch for visual display */
  swatch?: Swatch | null;
  /** Optional variant cover image */
  image?: Media | null;
}

/**
 * ProductOption - group of product options (e.g., Color, Size)
 */
export interface ProductOption {
  /** Global unique identifier */
  id: string;
  /** URL-friendly handle (e.g., "color", "size") */
  handle: string;
  /** Display title */
  title: string;
  /** How this option should be displayed */
  displayType: ProductOptionDisplayType;
  /** Available values for this option */
  values: Array<ProductOptionValue>;
}
