import { useCart } from "./useCart";
import { useCreateCart } from "./useCreateCart";
import { useMutation } from "react-relay";
import type { useAddItemToCartMutation as AddCartLineMutationType } from "@src/hooks/cart/useAddItemToCart/__generated__/useAddItemToCartMutation.graphql";
import { useBoxBuilderStore, useCurrencyStore } from "@src/store/appStore";
import { useCartContext } from "@src/providers/cart-context";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations, useLocale } from "next-intl";
import { useAddItemToCartMutation } from "@src/hooks/cart/useAddItemToCart/useAddItemToCart.shopana";

export const useAddItemToCart = () => {
  const t = useTranslations("toast");
  const [localeCode] = useLocale();
  useCart();
  const { setCartKey } = useCartContext();
  const [commitAddLine, isInFlight] =
    useMutation<AddCartLineMutationType>(useAddItemToCartMutation);

  const boxCartId = useBoxBuilderStore((s) => s.boxCartId);
  const setBoxCartId = useBoxBuilderStore((s) => s.setBoxCartId);
  const { createCart, isLoading: isCreatingCart } = useCreateCart();
  const currencyCode = useCurrencyStore((s) => s.currencyCode);

  return {
    addToCart: async (input: {
      productId: string;
      quantity: number;
      merchandise?: {
        __typename: string;
        id: string;
        title?: string;
        image?: string;
        price?: { amount: number; currencyCode: string };
      };
    }): Promise<any> => {
      // If no cart — first create cart and immediately add product
      if (!boxCartId) {
        const newCart = await createCart({
          idempotency: Math.random().toString(36).substring(2, 15),
          currencyCode,
          localeCode,
          items: [
            {
              purchasableId: input.productId,
              quantity: input.quantity
            },
          ],
        });
        const nextCart = newCart as any;
        if (!nextCart) {
          toast.error(t("add-failed"));
          setCartKey(null);
          setBoxCartId("");
          return null;
        }
        setCartKey(nextCart);
        const createdId = nextCart?.id as string | undefined;
        if (createdId) setBoxCartId(createdId);
        return nextCart;
      }

      // Otherwise add product to existing cart
      return new Promise<any>((resolve, reject) => {
        commitAddLine({
          variables: {
            input: {
              checkoutId: boxCartId,
              lines: [
                {
                  purchasableId: input.productId,
                  quantity: input.quantity,
                },
              ],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              toast.error(t("add-failed"));
              reject(errors);
              return;
            }
            if (
              response?.checkoutMutation?.checkoutLinesAdd?.errors &&
              response.checkoutMutation.checkoutLinesAdd.errors.length > 0
            ) {
              toast.error(t("add-failed"));
              reject(response.checkoutMutation.checkoutLinesAdd.errors);
              return;
            }
            const nextCart = response?.checkoutMutation?.checkoutLinesAdd?.checkout as any;
            if (!nextCart) {
              toast.error(t("cart-unavailable"));
              setCartKey(null);
              setBoxCartId("");
              resolve(null);
              return;
            }
            setCartKey(nextCart);
            const updatedId = nextCart?.id as string | undefined;
            if (updatedId) setBoxCartId(updatedId);
            resolve(nextCart);
          },
          onError: (err) => {
            toast.error(t("network-error"));
            reject(err);
          },
        });
      });
    },
    loading: isInFlight || isCreatingCart,
  };
};
