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
export { default as useCart } from '@shopana/storefront-sdk/modules/cart/react/hooks/useCart';
export { default as useCartId } from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartId';
export { default as useAddItemToCart } from '@shopana/storefront-sdk/modules/cart/react/hooks/useAddItemToCart';
export { default as useRemoveItemFromCart } from '@shopana/storefront-sdk/modules/cart/react/hooks/useRemoveItemFromCart';
export { default as useUpdateCartLineQuantity } from '@shopana/storefront-sdk/modules/cart/react/hooks/useUpdateCartLineQuantity';
export { default as useReplaceCartItem } from '@shopana/storefront-sdk/modules/cart/react/hooks/useReplaceCartItem';
export { default as useClearCart } from '@shopana/storefront-sdk/modules/cart/react/hooks/useClearCart';
export { default as useCreateCart } from '@shopana/storefront-sdk/modules/cart/react/hooks/useCreateCart';
export { default as useIsInTheCart } from '@shopana/storefront-sdk/modules/cart/react/hooks/useIsInTheCart';
export { default as useCartFragment } from '@shopana/storefront-sdk/modules/cart/react/hooks/useCartFragment';

// Context hooks
export {
  useCartContext,
  useCartStore,
  useCartConfig,
  useCartIdUtils,
} from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';

// Types
export type {
  UseIsInCartProps,
  UseIsInCartReturn,
} from '@shopana/storefront-sdk/modules/cart/react/hooks/useIsInTheCart';
export type {
  ReplaceCartItemInput,
  ClearCartInput,
  UseClearCartReturn,
  RemoveFromCartInput,
  AddToCartInput,
} from '@shopana/storefront-sdk/modules/cart/core/types';
//
