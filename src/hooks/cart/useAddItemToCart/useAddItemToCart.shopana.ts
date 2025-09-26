import useCart from "../useCart";
import { useCurrencyStore } from "@src/store/appStore";
import { graphql, useMutation } from "react-relay";
import { useAddItemToCartMutation as AddCartLineMutationType } from "@src/hooks/cart/useAddItemToCart/__generated__/useAddItemToCartMutation.graphql";

import { useCartContext } from "@src/providers/cart-context";
import useCreateCart from "@src/hooks/cart/useCreateCart";
import { AddToCartInput } from "./interface";
import { useLocale } from "next-intl";

export const useAddItemToCartMutation = graphql`
  mutation useAddItemToCartMutation($input: CheckoutLinesAddInput!) {
    checkoutMutation {
      checkoutLinesAdd(input: $input) {
        checkout {
          ...useCart_CartFragment
        }
        errors {
          field
          message
        }
      }
    }
  }
`;

const useAddItemToCart = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();
  const { createCart } = useCreateCart();
  const currencyCode = useCurrencyStore((state) => state.currencyCode);
  const [localeCode] = useLocale();
  const [commitAddLine, isInFlight] = useMutation<AddCartLineMutationType>(
    useAddItemToCartMutation
  );

  return {
    addToCart: async (input: AddToCartInput): Promise<unknown> => {
      // If no cart — create new one
      if (!cart?.id) {
        const newCart = await createCart({
          idempotency: "is not required",
          currencyCode,
          localeCode,
          items: [
            {
              purchasableId: input.purchasableId,
              quantity: input.quantity,
            },
          ],
        });
        // Update context with new cart key
        if (newCart) {
          setCartKey(newCart);
        }
        return newCart;
      }

      // If cart exists — add product through mutation
      return new Promise((resolve, reject) => {
        commitAddLine({
          variables: {
            input: {
              checkoutId: cart.id,
              lines: [
                {
                  purchasableId: input.purchasableId,
                  quantity: input.quantity,
                },
              ],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesAdd?.errors &&
              response.checkoutMutation.checkoutLinesAdd.errors.length > 0
            ) {
              reject(response.checkoutMutation.checkoutLinesAdd.errors);
            } else {
              if (response?.checkoutMutation?.checkoutLinesAdd?.checkout) {
                // Update context cart with new data
                setCartKey(response.checkoutMutation.checkoutLinesAdd.checkout);
              }

              resolve(response?.checkoutMutation?.checkoutLinesAdd?.checkout);
            }
          },
          onError: (err) => {
            reject(err);
          },
        });
      });
    },
    isInFlight,
  };
};

export default useAddItemToCart;
