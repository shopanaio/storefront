import { useCart } from "./useCart";
import { useMutation } from "react-relay";
import { clearCartLinesMutation } from "@src/relay/queries/clearCartLinesMutation.shopana";
import { clearCartLinesMutation as ClearCartLinesMutationType } from "@src/relay/queries/__generated__/clearCartLinesMutation.graphql";
import { useCartContext } from "@src/providers/cart-context";
import { removeCartIdCookie } from "@src/utils/cookieUtils";
import { useBoxBuilderStore } from "@src/store/appStore";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";

export const useClearCart = () => {
  const t = useTranslations("toast");
  useCart();
  const { setCartKey } = useCartContext();
  const [commit, isInFlight] =
    useMutation<ClearCartLinesMutationType>(clearCartLinesMutation);
  const boxCartId = useBoxBuilderStore((s) => s.boxCartId);
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);
  const setSelectedBoxId = useBoxBuilderStore((s) => s.setSelectedBoxId);
  const clearSelectedCardIds = useBoxBuilderStore((s) => s.clearSelectedCardIds);

  const clearCart = async (): Promise<
    ClearCartLinesMutationType["response"]["clearCartLines"]["cart"]
  > => {
    const cartId = boxCartId ?? "";
    if (!cartId) {
      toast.error(t("cart-not-found"));
      return null as any;
    }

    return new Promise((resolve, reject) => {
      commit({
        variables: { input: { cartId } },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            toast.error(t("clear-failed"));
            reject(errors);
            return;
          }
          if (
            response?.clearCartLines?.errors &&
            response.clearCartLines.errors.length > 0
          ) {
            toast.error(t("clear-failed"));
            reject(response.clearCartLines.errors);
            return;
          }

          const nextCart = response?.clearCartLines?.cart as any;
          if (!nextCart) {
            toast.error(t("cart-unavailable"));
            removeCartIdCookie();
            setCartKey(null);
            setBoxCartId("");
            setSelectedBoxId("");
            clearSelectedCardIds();
            resolve(null);
            return;
          }
          setCartKey(nextCart);
          const updatedId = nextCart?.id as string | undefined;
          if (updatedId) setBoxCartId(updatedId);
          // Clear product selection state in Box Builder
          setSelectedBoxId("");
          clearSelectedCardIds();
          resolve(nextCart);
        },
        onError: (err) => {
          toast.error(t("network-error"));
          reject(err);
        },
      });
    });
  };

  return { clearCart, isLoading: isInFlight };
};
