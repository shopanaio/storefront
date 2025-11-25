import { readInlineData, useFragment } from 'react-relay';
import { useCartContext } from '../context/CartContext';
import { useMemo } from 'react';
import { CartLineFragment_line } from './useCartLineFragment';
import { CartFragment_cart } from '../../core/graphql/fragments/CartFragment';
import type { CartFragment_cart$key } from '../../core/graphql/fragments/__generated__/CartFragment_cart.graphql';

const useCart = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();

  const cart = useFragment<CartFragment_cart$key>(
    CartFragment_cart,
    cartKey
  );

  const cartMemo = useMemo(() => {
    if (!cart) {
      return null;
    }
    return {
      ...cart,
      lines: (cart?.lines || [])?.map((cartLineRef: any) =>
        readInlineData(CartLineFragment_line, cartLineRef)
      ),
    };
  }, [cart]);

  return {
    cart: cartMemo,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};

export default useCart;
