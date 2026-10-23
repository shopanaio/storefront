import type { model } from '../../../model/namespace';
import type { CartMutationError } from './errors';

/**
 * Attribute for cart item
 */
export interface AddToCartAttribute {
  key: string;
  value: string;
}

/**
 * Child item in a bundle/group
 */
export interface AddToCartChildInput {
  componentItemId: string;
  purchasableId: string;
  quantity: number;
  attributes?: AddToCartAttribute[];
}

/**
 * Tag definition for checkout initialization
 */
export interface CheckoutTagDefinition {
  slug: string;
  unique: boolean;
}

/**
 * Input for adding item to cart
 */
export interface AddToCartInput {
  purchasableId: string;
  purchasableSnapshot: Pick<model.ProductVariant, 'compareAtPrice' | 'price'>;
  quantity: number;
  /**
   * Optional children lines to be added as a batch with the parent (bundle).
   */
  children?: AddToCartChildInput[];
  /**
   * Optional tag slug to associate with this line.
   * If the tag has unique=true, adding an item with this tag will replace any existing item with the same tag.
   */
  tagSlug?: string;
  /**
   * Optional tags to initialize when creating a new cart.
   * Only used when cart doesn't exist yet.
   */
  tags?: CheckoutTagDefinition[];
}

/**
 * Input for removing item from cart
 */
export interface RemoveFromCartInput {
  lineId: string;
}

/**
 * Input for clearing the entire cart
 */
export interface ClearCartInput {
  checkoutId?: string;
}

/**
 * Return type for useClearCart hook
 */
export interface UseClearCartReturn {
  /**
   * Resolves with the emptied cart, or null when there is no cart or the server dropped it.
   * Rejects only with `CartMutationError`.
   */
  clearCart: (
    input?: ClearCartInput,
    options?: MutationOptions<model.Cart | null>
  ) => Promise<model.Cart | null>;
  loading: boolean;
}

/**
 * Input for updating cart line quantity
 */
export interface UpdateCartLineInput {
  lineId: string;
  quantity: number;
  checkoutId?: string;
}

/**
 * Input for replacing a cart item with another.
 * Moves quantity from one line to a different purchasable (product variant).
 */
export interface ReplaceCartItemInput {
  /**
   * Source line ID to replace (quantity will be moved from this line).
   */
  lineId: string;
  /**
   * Target purchasable ID (product variant) to receive the quantity.
   */
  purchasableId: string;
  /**
   * Purchasable snapshot (price and compareAtPrice) to ensure price consistency.
   */
  purchasableSnapshot: Pick<model.ProductVariant, 'price' | 'compareAtPrice'>;
  /**
   * Quantity to move; if not set, moves full quantity from source line.
   * Must be greater than 0 if provided.
   */
  quantity?: number;
}

/**
 * Input for creating a new cart
 */
export interface CreateCartInput {
  currencyCode: string;
  localeCode: string;
  items: {
    purchasableId: string;
    quantity: number;
    /** How the line is purchased; the API default applies when missing. */
    purchase?: { type: string };
    /** Line attributes, passed to the API as they are (JSON). */
    attributes?: object;
    tagSlug?: string;
    children?: AddToCartChildInput[];
  }[];
  /**
   * Optional tags to initialize for this checkout.
   */
  tags?: CheckoutTagDefinition[];
}

/**
 * Options for mutation callbacks
 */
export interface MutationOptions<TResult = model.Cart> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: CartMutationError) => void;
}
