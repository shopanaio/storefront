import useCart from "../useCart";
import { useCartContext } from "@src/providers/cart-context";
import { useMutation, graphql } from "react-relay";
import { CartLineQuantityMutation as CartLineQuantityMutationType } from "@src/relay/queries/__generated__/CartLineQuantityMutation.graphql";
import cartIdUtils from "@src/utils/cartId";

// Define mutation inside hook with correct name
const useUpdateCartLineQuantityMutation = graphql`
  mutation useUpdateCartLineQuantityMutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
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

const useUpdateCartLineQuantity = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();
  const [commit, isInFlight] = useMutation<CartLineQuantityMutationType>(useUpdateCartLineQuantityMutation);

  const updateQuantity = async ({ cartItemId, quantity }: { cartItemId: string; quantity: number; }) => {
    const cartId = cart?.id;
    if (!cartId || !cart?.id) {
      console.warn("[useUpdateCartLineQuantity] No cart to update");
      return null;
    }
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          cartId: cart.id,
          lines: [{ id: cartItemId, quantity }],
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            reject(errors);
          } else if (response?.cartLinesUpdate?.userErrors && response.cartLinesUpdate.userErrors.length > 0) {
            reject(response.cartLinesUpdate.userErrors);
          } else {
            // If cart became null — reset cookie and context
            if (!response?.cartLinesUpdate?.cart) {
              cartIdUtils.removeCartIdCookie();
              setCartKey(null);
            } else {
              setCartKey(response.cartLinesUpdate.cart);
            }
            resolve(response?.cartLinesUpdate?.cart);
          }
        },
        onError: (err) => {
          reject(err);
        },
      });
    });
  };

  return { updateQuantity, loading: isInFlight };
}

export default useUpdateCartLineQuantity;
