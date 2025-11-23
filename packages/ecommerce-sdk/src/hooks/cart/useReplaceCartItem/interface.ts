import { Entity } from '@shopana/entity';

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
  purchasableSnapshot: Pick<Entity.ProductVariant, 'price' | 'compareAtPrice'>;
  /**
   * Quantity to move; if not set, moves full quantity from source line.
   * Must be greater than 0 if provided.
   */
  quantity?: number;
}
