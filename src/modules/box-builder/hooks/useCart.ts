import { useEffect } from "react";
import { useFragment } from "react-relay";
import { useCart_CartFragment } from "@src/hooks/cart/useCart/useCart.shopana";
import { useCartContext } from "@src/providers/cart-context";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCart/useCart.shopana";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useSyncCartState } from "@src/modules/box-builder/hooks/useSyncCartState";

export function useCart() {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();
  const boxCartId = useBoxBuilderStore((s) => s.boxCartId);
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);

  const cart = useFragment<useCart_CartFragment$key>(useCart_CartFragment, cartKey);

  // In Box Builder, if cart is loaded, try to synchronize id in zustand
  // Fragment key type doesn't expose fields directly, so cast to any when reading id
  const cartId = (cart as any)?.id as string | undefined;

  useEffect(() => {
    if (cartId && cartId !== boxCartId) {
      setBoxCartId(cartId);
    }
  }, [cartId, boxCartId, setBoxCartId]);

  // Synchronize Box Builder selections with real cart
  useSyncCartState(cart, isCartLoaded);

  return {
    cart,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
}
