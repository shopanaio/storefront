/**
 * Hook for replacing cart items in Shopana checkout.
 *
 * This hook uses the `checkoutLinesReplace` mutation to move quantity from one cart line
 * to a different purchasable (product variant).
 * Useful when swapping product variants or replacing items in a cart.
 *
 * @example
 * ```tsx
 * const { replaceCartItem, loading } = useReplaceCartItem();
 *
 * await replaceCartItem(
 *   {
 *     lineId: "old-line-id",
 *     purchasableId: "new-purchasable-id",
 *     quantity: 2, // optional, if not provided moves all quantity
 *   },
 *   {
 *     onSuccess: () => console.log('Item replaced successfully'),
 *     onError: () => console.error('Failed to replace item'),
 *   }
 * );
 * ```
 */
import useCart from "../useCart";
import { useCartContext } from "@src/providers/cart-context";
import { graphql, useMutation } from "react-relay";
import { useReplaceCartItemMutation as ReplaceCartItemMutationType } from "@src/hooks/cart/useReplaceCartItem/__generated__/useReplaceCartItemMutation.graphql";
import cartIdUtils from "@src/utils/cartId";
import { ReplaceCartItemInput } from "./interface";

export const useReplaceCartItemMutation = graphql`
  mutation useReplaceCartItemMutation(
    $input: CheckoutLinesReplaceInput!
  ) {
    checkoutMutation {
      checkoutLinesReplace(input: $input) {
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

const useReplaceCartItem = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();
  const [commit, isInFlight] = useMutation<ReplaceCartItemMutationType>(
    useReplaceCartItemMutation
  );

  const replaceCartItem = async (
    input: ReplaceCartItemInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const cartId = cart?.id;
    if (!cartId || !cart?.id) {
      console.warn("[useReplaceCartItem] No cart to replace items in");
      return null;
    }

    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            checkoutId: cart.id,
            lines: [
              {
                lineId: input.lineId,
                purchasableId: input.purchasableId,
                ...(input.quantity !== undefined && { quantity: input.quantity }),
              },
            ],
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            options?.onError?.();
            return reject(errors);
          } else if (
            response?.checkoutMutation?.checkoutLinesReplace?.errors &&
            response.checkoutMutation.checkoutLinesReplace.errors.length > 0
          ) {
            options?.onError?.();
            return reject(response.checkoutMutation.checkoutLinesReplace.errors);
          } else {
            // If checkout became null — reset cookie and context
            if (!response?.checkoutMutation?.checkoutLinesReplace?.checkout) {
              cartIdUtils.removeCartIdCookie();
              setCartKey(null);
            } else {
              setCartKey(
                response.checkoutMutation.checkoutLinesReplace.checkout
              );
            }
            options?.onSuccess?.();
            return resolve(
              response?.checkoutMutation?.checkoutLinesReplace?.checkout
            );
          }
        },
        onError: (err) => {
          options?.onError?.();
          return reject(err);
        },
      });
    });
  };

  return { replaceCartItem, loading: isInFlight };
};

export default useReplaceCartItem;
