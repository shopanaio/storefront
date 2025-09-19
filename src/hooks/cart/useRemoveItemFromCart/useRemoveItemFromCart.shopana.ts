import useCart from "../useCart";
import { useMutation, graphql } from "react-relay";
import cartIdUtils from "@src/utils/cartId";
import { useCartContext } from "@src/providers/cart-context";
import { RemoveFromCartInput } from "./index";

// Define mutation inside hook with correct name
const useRemoveItemFromCartMutation = graphql`
  mutation useRemoveItemFromCartMutation($input: RemoveCartLineInput!) {
    removeCartLine(input: $input) {
      cart {
        ...useCart_CartFragment
      }
      errors {
        message
      }
    }
  }
`;

const useRemoveItemFromCart = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();

  const [commitRemoveLine] = useMutation<any>(
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
              cartId: cart.id,
              productId: input.productLine.purchasable.id,
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              reject(errors);
            } else if (
              response?.removeCartLine?.errors &&
              response.removeCartLine.errors.length > 0
            ) {
              reject(response.removeCartLine.errors);
            } else {
              // If cart became null — remove cookie and clear context
              if (!response?.removeCartLine?.cart) {
                cartIdUtils.removeCartIdCookie();
                setCartKey(null);
              } else {
                // Updating context cart fresh data
                setCartKey(response.removeCartLine.cart);
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
  };
};

export default useRemoveItemFromCart;
