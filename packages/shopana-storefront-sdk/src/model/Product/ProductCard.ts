import type { Media } from '../Media';
import type { Money } from '../Money';

/**
 * A product as listing surfaces show it (ADR-023): collections, search, recommendations and the
 * wishlist. The listing picked the variant the card shows, links to and adds to the cart.
 */
export interface ProductCard {
  __typename?: 'ProductCard';
  /**
   * Opaque id of the card: the product and, when the source fixed one, the variant. Not a
   * product id.
   */
  id: string;
  /** Global id of the product. */
  productId: string;
  handle: string;
  title: string;
  vendor?: { name: string } | null;
  /** At least one variant of the product is available for sale. */
  availableForSale: boolean;
  /** The first media of the product gallery. */
  featuredMedia?: Media | null;
  variant: ProductCardVariant;
}

/** The variant of a product card. */
export interface ProductCardVariant {
  __typename?: 'ProductCardVariant';
  id: string;
  handle: string;
  title: string;
  /** Null when the variant has no offer price yet: it is not for sale. */
  price: Money | null;
  compareAtPrice: Money | null;
  availableForSale: boolean;
  /** The variant cover; the first media of the product gallery without one. */
  featuredMedia?: Media | null;
}
