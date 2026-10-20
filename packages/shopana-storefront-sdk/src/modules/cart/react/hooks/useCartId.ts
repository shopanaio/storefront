'use client';

import { useCartContext } from '../context/CartContext';

/**
 * Returns the cart ID with loading states from context.
 * This is a lightweight alternative to useCart when only the ID is needed.
 * Does not trigger any GraphQL queries - reads directly from context state.
 *
 * @returns {Object} Object containing cartId, loading and loaded states, and the load error
 *   with its retry
 */
const useCartId = () => {
  const { cartId, isCartLoading, isCartLoaded, cartError, retryCart } =
    useCartContext();

  return {
    cartId,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: cartError,
    retry: retryCart,
  };
};

export default useCartId;
