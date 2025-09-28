import useCart from "../useCart";
import { useMutation, graphql } from "react-relay";
import cartIdUtils from "@src/utils/cartId";
import { useCartContext } from "@src/providers/cart-context";
import { RemoveFromCartInput } from "./index";

// Define mutation inside hook with correct name
const useRemoveItemFromCartMutation = graphql`
  mutation useRemoveItemFromCartMutation($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        ... useCart_CartFragment
      }
      userErrors {
        field
        message
        code
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

      return new Promise<any>((resolve, reject) => {
        commitRemoveLine({
          variables: {
            cartId: cart.id,
            lineIds: [(input.checkoutLine as any).id],
          },
          onCompleted: (response: any, errors: any) => {
            if (errors && errors.length > 0) {
              reject(errors);
            } else if (
              response?.cartLinesRemove?.userErrors &&
              response.cartLinesRemove.userErrors.length > 0
            ) {
              reject(response.cartLinesRemove.userErrors);
            } else {
              // If cart became null — remove cookie and clear context
              if (!response?.cartLinesRemove?.cart) {
                cartIdUtils.removeCartIdCookie();
                setCartKey(null);
              } else {
                // Updating context cart fresh data
                setCartKey(response.cartLinesRemove.cart);
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
