import useCart from "../useCart";
import { useCurrencyStore } from "@src/store/appStore";
import { graphql, useMutation } from "react-relay";
import { useAddItemToCartMutation as AddCartLineMutationType } from "@src/hooks/cart/useAddItemToCart/__generated__/useAddItemToCartMutation.graphql";

import { useCartContext } from "@src/providers/cart-context";
import useCreateCart from "@src/hooks/cart/useCreateCart";
import { AddToCartInput } from "./index";

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
  const [commitAddLine] = useMutation<AddCartLineMutationType>(
    useAddItemToCartMutation
  );

  return {
    addToCart: async (input: AddToCartInput): Promise<any> => {
      const cartId = cart?.id;
      const variantId = input.productVariantId;

      // If no cart — create new one
      if (!cartId || !cart?.id) {
        console.log("Creating new cart with currency:", currencyCode);
        const newCart = await createCart({
          // TODO: Fix
          currencyCode: "USD" as any,
          idempotency: "123",
          localeCode: "en",
          items: [
            {
              purchasableId: variantId,
              quantity: input.quantity,
            },
          ],
        });
        console.log("New cart created:", newCart);
        // Update context with new cart key
        if (newCart) {
          setCartKey(newCart);
        }
        return newCart;
      }

      // If cart exists — add product through mutation
      console.log("Adding to existing cart:", cart.id);
      return new Promise<any>((resolve, reject) => {
        commitAddLine({
          variables: {
            input: {
              checkoutId: cart.id,
              lines: [
                {
                  purchasableId: variantId,
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
  };
};

export default useAddItemToCart;
