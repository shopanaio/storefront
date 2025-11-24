import type { model } from '../../../model';

/**
 * Cart store interface - matches Zustand implementation
 * This is the same interface as in @src/store/cartStore.ts
 */
export interface CartStore {
  // State
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  version: number;

  // Actions
  setCart(cart: model.Cart | null): void;

  // Item operations compatible with mutations - matching original naming
  checkoutLinesAdd(input: {
    lines: Array<{
      purchasableId: string;
      quantity: number;
      children?: Array<{ quantity: number }>;
    }>;
    pricing?: Record<
      string,
      { unitPrice: number; compareAtUnitPrice?: number; currencyCode: string }
    >;
  }): { version: number; revert(): void };

  checkoutLinesDelete(input: { lineIds: string[] }): { version: number; revert(): void };

  checkoutLinesUpdate(input: {
    lines: Array<{ lineId: string; quantity: number }>;
  }): { version: number; revert(): void };

  checkoutLinesReplace(input: {
    lines: Array<{ lineId: string; purchasableId: string; quantity?: number }>;
    pricing?: Record<
      string,
      { unitPrice: number; compareAtUnitPrice?: number; currencyCode: string }
    >;
  }): { version: number; revert(): void };

  checkoutClear(): { version: number; revert(): void };
}

/**
 * Store implementation interface for dependency injection
 */
export interface StoreImplementation<T> {
  getState(): T;
  setState(state: T | ((prev: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}
