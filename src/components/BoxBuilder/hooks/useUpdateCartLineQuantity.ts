import { useCart } from "./useCart";
import { useCartContext } from "@src/providers/cart-context";
import { useMutation } from "react-relay";
import { useUpdateCartLineQuantityMutation } from "@src/hooks/cart/useUpdateCartLineQuantity/useUpdateCartLineQuantity.shopana";
import { CartLineQuantityMutation as CartLineQuantityMutationType } from "@src/relay/queries/__generated__/CartLineQuantityMutation.graphql";
import cartIdUtils from "@src/utils/cartId";
import { useBoxBuilderStore } from "@src/store/appStore";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";

export function useUpdateCartLineQuantity() {
  const t = useTranslations("toast");
  const { cart } = useCart();
  const { setCartKey } = useCartContext();
  const [commit, isInFlight] = useMutation<CartLineQuantityMutationType>(
    useUpdateCartLineQuantityMutation
  );
  const boxCartId = useBoxBuilderStore((s) => s.boxCartId);

  const updateQuantity = async ({
    cartItemId,
    quantity,
  }: {
    cartItemId: string;
    quantity: number;
  }) => {
    // In Box Builder use only cart id from zustand
    const cartId = boxCartId ?? "";
    if (!cartId) {
      toast.error(t("cart-not-found"));
      return null;
    }
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            cartId,
            cartItemId,
            quantity,
          },
        },

        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            toast.error(t("update-qty-failed"));
            reject(errors);
          } else if (
            response?.updateCartLineQuantity?.errors &&
            response.updateCartLineQuantity.errors.length > 0
          ) {
            toast.error(t("update-qty-failed"));
            reject(response.updateCartLineQuantity.errors);
          } else {
            if (!response?.updateCartLineQuantity?.cart) {
              toast.error(t("cart-unavailable"));
              cartIdUtils.removeCartIdCookie();
              setCartKey(null);
            } else {
              setCartKey(response.updateCartLineQuantity.cart);
            }
            resolve(response?.updateCartLineQuantity?.cart);
          }
        },
        onError: (err) => {
          toast.error(t("network-error"));
          reject(err);
        },
      });
    });
  };

  return { updateQuantity, loading: isInFlight };
}
