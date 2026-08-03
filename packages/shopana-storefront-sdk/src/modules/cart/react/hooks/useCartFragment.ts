import { readInlineData, useFragment } from 'react-relay';
import { useCartContext } from '../context/CartContext';
import { useMemo } from 'react';
import { CartLineFragment_line } from './useCartLineFragment';
import { CartFragment_cart } from '../../core/graphql/fragments/CartFragment';
import type { CartFragment_cart$key } from '../../core/graphql/fragments/__generated__/CartFragment_cart.graphql';
import type { CartLineFragment_line$data } from '../../core/graphql/fragments/__generated__/CartLineFragment_line.graphql';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';

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
    const denormalizedCart = {
      ...cart,
      lines: cart.lines.map((cartLineRef) =>
        readInlineData(CartLineFragment_line, cartLineRef) as CartLineFragment_line$data
      ),
    };

    return mapShopanaCheckoutToEntityCart(denormalizedCart);
  }, [cart]);

  return {
    cart: cartMemo,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};

export default useCart;
