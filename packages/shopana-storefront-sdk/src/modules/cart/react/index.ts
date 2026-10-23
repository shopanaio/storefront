/**
 * Cart React Module: `@shopana/storefront-sdk/modules/cart/react`
 *
 * What a storefront module does with the cart around a sign-in: the account cart claims the
 * guest cart, and the event it sends on `window` once it did. Also the error every cart
 * mutation hook rejects with.
 */
export {
  CART_CLAIMED_EVENT,
  useClaimAccountCart,
  type CartClaimedEventDetail,
} from './providers/AccountCartSync';
export { useCartClaimed } from './hooks/useCartClaimed';
export {
  CartMutationError,
  isCartMutationError,
  type CartMutationErrorKind,
  type CartUserError,
} from '../core/errors';
export {
  MutationSupersededError,
  isMutationSuperseded,
} from '../core/utils/mutationQueue';
export {
  useCartLocalization,
  type CartLocalization,
} from './context/CartContext';
export { cartRecommendationLines } from '../core/utils/cartRecommendationLines';
