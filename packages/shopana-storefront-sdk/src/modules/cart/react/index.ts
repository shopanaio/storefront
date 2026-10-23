/**
 * Cart React Module: `@shopana/storefront-sdk/modules/cart/react`
 *
 * What a storefront module does with the cart around a sign-in: the account cart claims the
 * guest cart, and the event it sends on `window` once it did.
 */
export {
  CART_CLAIMED_EVENT,
  useClaimAccountCart,
  type CartClaimedEventDetail,
} from './providers/AccountCartSync';
export { useCartClaimed } from './hooks/useCartClaimed';
