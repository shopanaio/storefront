import { useCartContext } from '../context/CartContext';
import { useMemo } from 'react';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useCart = () => {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();
  const cart = cartKey;
  const cartMemo = useMemo(() => {
    if (!cart) {
      return null;
    }
    return mapShopanaCheckoutToEntityCart(cart);
  }, [cart]);
  return {
    cart: cartMemo,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
};
export default useCart;
