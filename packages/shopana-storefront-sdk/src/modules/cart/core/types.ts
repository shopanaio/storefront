import { model } from '../../../model';

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
  purchasableId: string;
  quantity: number;
  groupId?: string;
  attributes?: AddToCartAttribute[];
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
  clearCart: (
    input?: ClearCartInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => Promise<any>;
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
    children?: AddToCartChildInput[];
  }[];
}

/**
 * Options for mutation callbacks
 */
export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error?: any) => void;
}
