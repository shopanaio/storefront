"use client";

import { useCartStore } from '../context';
import { useShallow } from 'zustand/shallow';

/**
 * Lightweight hook that returns only the cart ID
 * Use this instead of useCart when you only need the cart ID
 *
 * @example
 * const cartId = useCartId();
 */
export function useCartIdOnly() {
  const useStore = useCartStore();
  return useStore((s) => s.cart?.id ?? null);
}

/**
 * Lightweight hook that returns only the cart data (without loading/error states)
 * Use this instead of useCart when you don't need loading/error states
 *
 * @example
 * const cart = useCartData();
 */
export function useCartData() {
  const useStore = useCartStore();
  return useStore((s) => s.cart);
}

/**
 * Hook that returns only loading states
 * Use this when you only need to track loading/loaded/error
 *
 * @example
 * const { loading, loaded, error } = useCartLoadingState();
 */
export function useCartLoadingState() {
  const useStore = useCartStore();
  return useStore(
    useShallow((s) => ({
      loading: s.loading,
      loaded: s.loaded,
      error: s.error,
    }))
  );
}

/**
 * Optimized hook that checks if a product is in the cart
 * Only re-renders when the specific product's presence changes
 *
 * @example
 * const isInCart = useIsInCart('product-id-123');
 */
export function useIsInCart(purchasableId: string): boolean {
  const useStore = useCartStore();
  return useStore((s) =>
    s.cart?.lines?.some((line) => line?.purchasableId === purchasableId) ?? false
  );
}

/**
 * Optimized hook that returns the cart line ID for a specific product
 * Only re-renders when the specific product's line ID changes
 *
 * @example
 * const lineId = useCartLineId('product-id-123');
 */
export function useCartLineId(purchasableId: string): string | null {
  const useStore = useCartStore();
  return useStore(
    (s) =>
      s.cart?.lines?.find((line) => line?.purchasableId === purchasableId)?.id ?? null
  );
}

/**
 * Optimized hook that returns the quantity for a specific product in cart
 * Only re-renders when the specific product's quantity changes
 *
 * @example
 * const quantity = useCartLineQuantity('product-id-123');
 */
export function useCartLineQuantity(purchasableId: string): number {
  const useStore = useCartStore();
  return useStore(
    (s) =>
      s.cart?.lines?.find((line) => line?.purchasableId === purchasableId)?.quantity ?? 0
  );
}

/**
 * Optimized hook that returns full cart line info for a specific product
 * Only re-renders when the specific product's line data changes
 *
 * @example
 * const cartLine = useCartLine('product-id-123');
 * if (cartLine) {
 *   console.log(cartLine.id, cartLine.quantity);
 * }
 */
export function useCartLine(purchasableId: string) {
  const useStore = useCartStore();
  return useStore(
    (s) => s.cart?.lines?.find((line) => line?.purchasableId === purchasableId) ?? null
  );
}

/**
 * Optimized hook that returns cart line info with specific fields
 * Use this when you need multiple fields but not the entire line
 *
 * @example
 * const item = useCartLineItem('product-id-123');
 * if (item) {
 *   console.log(item.id, item.quantity);
 * }
 */
export function useCartLineItem(purchasableId: string) {
  const useStore = useCartStore();
  return useStore(
    useShallow((s) => {
      const item = s.cart?.lines?.find((line) => line?.purchasableId === purchasableId);

      return item
        ? {
            id: item.id,
            quantity: item.quantity,
            purchasableId: item.purchasableId,
          }
        : null;
    })
  );
}
