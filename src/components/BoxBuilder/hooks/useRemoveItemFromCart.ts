import { useCart } from "./useCart";
import { useMutation } from "react-relay";
import { removeCartLineMutation } from "@src/relay/queries/removeCartLineMutation.shopana";
import { removeCartIdCookie } from "@src/utils/cookieUtils";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useCartContext } from "@src/providers/cart-context";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";

export const useRemoveItemFromCart = () => {
  const t = useTranslations("toast");
  useCart();
  const { setCartKey } = useCartContext();
  const boxCartId = useBoxBuilderStore((s) => s.boxCartId);
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);

  const [commitRemoveLine, isInFlight] = useMutation<any>(
    // @ts-ignore – Type will be available after generation
    removeCartLineMutation
  );

  return {
    removeFromCart: async (input: { productId: string }): Promise<any> => {
      // In Box Builder use only cart id from zustand
      const cartId = boxCartId ?? "";

      if (!cartId) {
        toast.error(t("cart-not-found"));
        return null;
      }

      return new Promise((resolve, reject) => {
        commitRemoveLine({
          variables: {
            input: {
              cartId,
              productId: input.productId,
            },
          },
          onCompleted: (response: any, errors: any) => {
            if (errors && errors.length > 0) {
              toast.error(t("remove-failed"));
              reject(errors);
            } else if (
              response?.removeCartLine?.errors &&
              response.removeCartLine.errors.length > 0
            ) {
              toast.error(t("remove-failed"));
              reject(response.removeCartLine.errors);
            } else {
              const nextCart = response?.removeCartLine?.cart as any;
              if (!nextCart) {
                toast.error(t("cart-unavailable"));
                removeCartIdCookie();
                setCartKey(null);
                setBoxCartId("");
                resolve(null);
                return;
              }
              setCartKey(nextCart);
              const updatedId = nextCart?.id as string | undefined;
              if (updatedId) setBoxCartId(updatedId);
              resolve(nextCart);
            }
          },
          onError: (err) => {
            toast.error(t("network-error"));
            reject(err);
          },
        });
      });
    },
    loading: isInFlight,
  };
};
