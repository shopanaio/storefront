import { useCart } from "./useCart";
import { useCreateCart } from "./useCreateCart";
import { useMutation } from "react-relay";
import { addCartLineMutation as AddCartLineMutationType } from "@src/relay/queries/__generated__/addCartLineMutation.graphql";
import { useBoxBuilderStore, useCurrencyStore } from "@src/store/appStore";
import { useCartContext } from "@src/providers/cart-context";
import { toast } from "@src/components/UI/Toast/Toast";
import { useTranslations } from "next-intl";
import { useAddItemToCartMutation } from "@src/hooks/cart/useAddItemToCart/useAddItemToCart.shopana";

export const useAddItemToCart = () => {
  const t = useTranslations("toast");
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
          currencyCode,
          items: [
            { productId: input.productId, quantity: input.quantity } as any,
          ],
        } as any);
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
              cartId: boxCartId,
              productId: input.productId,
              quantity: input.quantity,
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              toast.error(t("add-failed"));
              reject(errors);
              return;
            }
            if (
              response?.addCartLine?.errors &&
              response.addCartLine.errors.length > 0
            ) {
              toast.error(t("add-failed"));
              reject(response.addCartLine.errors);
              return;
            }
            const nextCart = response?.addCartLine?.cart as any;
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
