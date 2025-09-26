import useCart from "../useCart";
import { useMutation, graphql } from "react-relay";
import cartIdUtils from "@src/utils/cartId";
import { useCartContext } from "@src/providers/cart-context";
import { RemoveFromCartInput } from "./index";

// Define mutation inside hook with correct name
export const useRemoveItemFromCartMutation = graphql`
  mutation useRemoveItemFromCartMutation($input: CheckoutLinesDeleteInput!) {
    checkoutMutation {
      checkoutLinesDelete(input: $input) {
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

const useRemoveItemFromCart = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();

  const [commitRemoveLine, isInFlight] = useMutation<any>(
    useRemoveItemFromCartMutation
  );

  return {
    removeFromCart: async (input: RemoveFromCartInput): Promise<any> => {
      const cartId = cart?.id;

      // If no cart in cookie or context — just exit
      if (!cartId || !cart?.id) {
        console.warn("[useRemoveItemFromCart] No cart to remove from");
        return null;
      }

      return new Promise((resolve, reject) => {
        commitRemoveLine({
          variables: {
            input: {
              checkoutId: cart.id,
              lineIds: [(input.checkoutLine as any).id],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesDelete?.errors &&
              response.checkoutMutation.checkoutLinesDelete.errors.length > 0
            ) {
              reject(response.checkoutMutation.checkoutLinesDelete.errors);
            } else {
              // If checkout became null — remove cookie and clear context
              if (!response?.checkoutMutation?.checkoutLinesDelete?.checkout) {
                cartIdUtils.removeCartIdCookie();
                setCartKey(null);
              } else {
                // Updating context cart fresh data
                setCartKey(response.checkoutMutation.checkoutLinesDelete.checkout);
              }
              resolve(response);
            }
          },
          onError: (err) => {
            reject(err);
          },
        });
      });
    },
    loading: isInFlight,
  };
};

export default useRemoveItemFromCart;
