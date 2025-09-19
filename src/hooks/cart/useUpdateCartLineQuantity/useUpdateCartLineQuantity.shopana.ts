import useCart from "../useCart";
import { useCartContext } from "@src/providers/cart-context";
import { graphql, useMutation } from "react-relay";
//import { CartLineQuantityMutation } from "@src/relay/queries/CartLineQuantityMutation.shopana";
import { useUpdateCartLineQuantityMutation as CartLineQuantityMutationType } from "@src/hooks/cart/useUpdateCartLineQuantity/__generated__/useUpdateCartLineQuantityMutation.graphql";
import cartIdUtils from "@src/utils/cartId";

export const useUpdateCartLineQuantityMutation = graphql`
  mutation useUpdateCartLineQuantityMutation($input: UpdateCartLineQuantityInput!) {
    updateCartLineQuantity(input: $input) {
      cart {
        ...useCart_CartFragment
      }
      errors {
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
          input: {
            cartId: cart.id,
            cartItemId,
            quantity,
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            reject(errors);
          } else if (response?.updateCartLineQuantity?.errors && response.updateCartLineQuantity.errors.length > 0) {
            reject(response.updateCartLineQuantity.errors);
          } else {
            // If cart became null — reset cookie and context
            if (!response?.updateCartLineQuantity?.cart) {
              cartIdUtils.removeCartIdCookie();
              setCartKey(null);
            } else {
              setCartKey(response.updateCartLineQuantity.cart);
            }
            resolve(response?.updateCartLineQuantity?.cart);
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
