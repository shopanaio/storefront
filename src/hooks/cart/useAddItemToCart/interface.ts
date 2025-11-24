import { model } from '@shopana/storefront-sdk';

export interface AddToCartAttribute {
  key: string;
  value: string;
}

export interface AddToCartChildInput {
  purchasableId: string;
  quantity: number;
  groupId?: string;
  attributes?: AddToCartAttribute[];
}

export interface AddToCartInput {
  purchasableId: string;
  purchasableSnapshot: Pick<model.ProductVariant, 'compareAtPrice' | 'price'>;
  quantity: number;
  /**
   * Optional children lines to be added as a batch with the parent (bundle).
   */
  children?: AddToCartChildInput[];
}
