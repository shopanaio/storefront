import { useEffect } from "react";
import { useFragment } from "react-relay";
import { useCart_CartFragment } from "@src/hooks/cart/useCart/useCart.shopana";
import { useCartContext } from "@src/providers/cart-context";
import { useCart_CartFragment$key } from "@src/hooks/cart/useCart/__generated__/useCart_CartFragment.graphql";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useSyncCartState } from "@src/modules/box-builder/hooks/useSyncCartState";

export function useCart() {
  const { cartKey, isCartLoading, isCartLoaded } = useCartContext();
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);

  const cart = useFragment<useCart_CartFragment$key>(useCart_CartFragment, cartKey);

  // Keep zustand in sync with actual cart ID
  const cartId = (cart as any)?.id as string | undefined;

  useEffect(() => {
    if (cartId) {
      setBoxCartId(cartId);
    }
  }, [cartId, setBoxCartId]);

  // Synchronize Box Builder selections with real cart
  useSyncCartState(cart, isCartLoaded);

  return {
    cart,
    loading: isCartLoading,
    loaded: isCartLoaded,
    error: null,
  };
}
