import type { Money } from '../Money';
import type { Media } from '../Media';

/**
 * ProductGroupPriceType - pricing strategy for group items
 */
export type ProductGroupPriceType = 'BASE' | 'FIXED' | 'PERCENT' | 'FREE';

/**
 * ProductGroupPrice - pricing configuration for group item
 */
export interface ProductGroupPrice {
  /** Fixed amount to add (only for FIXED type) */
  amount?: Money | null;
  /** Percentage to add (only for PERCENT type) */
  percentage?: number | null;
}

/**
 * ProductGroupNode - reference to a product in a group
 */
export interface ProductGroupNode {
  /** Global unique identifier */
  id: string;
  /** Product title */
  title: string;
  /** URL-friendly slug */
  handle: string;
  /** Product price */
  price: Money;
  /** Cover image */
  cover?: Media | null;
}

/**
 * ProductGroupItem - item within a product group
 */
export interface ProductGroupItem {
  /** The product node */
  node: ProductGroupNode;
  /** Maximum quantity allowed */
  maxQuantity?: number;
  /** Price configuration for this item */
  price: ProductGroupPrice;
}

/**
 * ProductGroup - group of related products (e.g., bundles)
 */
export interface ProductGroup {
  /** Global unique identifier */
  id: string;
  /** Group title */
  title: string;
  /** Whether selection from this group is required */
  isRequired: boolean;
  /** Whether multiple items can be selected */
  isMultiple: boolean;
  /** Items in this group */
  items: Array<ProductGroupItem>;
}
