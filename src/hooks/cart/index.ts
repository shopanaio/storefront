/**
 * Cart Hooks - SDK Integration
 *
 * Re-exports all cart hooks from SDK for convenience.
 * Old CMS-specific hooks are kept in their respective folders for reference.
 *
 * Usage:
 * ```ts
 * import { useCart, useAddItemToCart } from '@src/hooks/cart';
 * ```
 *
 * Or import directly from SDK:
 * ```ts
 * import { useCart } from '@shopana/storefront-sdk/modules/cart/react';
 * ```
 */

// Main cart hooks
export {
  useCart,
  useCartId,
  useAddItemToCart,
  useRemoveItemFromCart,
  useUpdateCartLineQuantity,
  useReplaceCartItem,
  useClearCart,
  useCreateCart,
  useIsInTheCart,
  useCartFragment,
} from '@shopana/storefront-sdk/modules/cart/react';

// Context hooks
export {
  useCartContext,
  useCartStore,
  useCartConfig,
  useCartIdUtils,
} from '@shopana/storefront-sdk/modules/cart/react';

// Types
export type {
  UseIsInCartProps,
  UseIsInCartReturn,
  ReplaceCartItemInput,
  ClearCartInput,
  UseClearCartReturn,
  RemoveFromCartInput,
  AddToCartInput,
} from '@shopana/storefront-sdk/modules/cart/react';
//
