import { readInlineData, useFragment } from 'react-relay';
import { useCartContext } from '../context';
import { useMemo } from 'react';
import { useCartLineFragment_CartLineFragment } from './useCartLineFragment';
import { useCart_CartFragment } from '../../core/graphql/fragments/CartFragment';
import type { useCart_CartFragment$key } from '../../core/graphql/fragments/__generated__/useCart_CartFragment.graphql';

const useCart = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();

  const cart = useFragment<useCart_CartFragment$key>(
    useCart_CartFragment,
    cartKey
  );

  const cartMemo = useMemo(() => {
    if (!cart) {
      return null;
    }
    return {
      ...cart,
      lines: (cart?.lines || [])?.map((cartLineRef: any) =>
        readInlineData(useCartLineFragment_CartLineFragment, cartLineRef)
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
