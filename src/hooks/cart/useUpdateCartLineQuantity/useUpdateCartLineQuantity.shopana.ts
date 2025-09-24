import useCart from "../useCart";
import { useCartContext } from "@src/providers/cart-context";
import { graphql, useMutation } from "react-relay";
//import { CartLineQuantityMutation } from "@src/relay/queries/CartLineQuantityMutation.shopana";
import { useUpdateCartLineQuantityMutation as CartLineQuantityMutationType } from "@src/hooks/cart/useUpdateCartLineQuantity/__generated__/useUpdateCartLineQuantityMutation.graphql";
import cartIdUtils from "@src/utils/cartId";

export const useUpdateCartLineQuantityMutation = graphql`
  mutation useUpdateCartLineQuantityMutation($input: CheckoutLinesUpdateInput!) {
    checkoutMutation {
      checkoutLinesUpdate(input: $input) {
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
            checkoutId: cart.id,
            lines: [{
              lineId: cartItemId,
              quantity,
            }],
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            reject(errors);
          } else if (response?.checkoutMutation?.checkoutLinesUpdate?.errors && response.checkoutMutation.checkoutLinesUpdate.errors.length > 0) {
            reject(response.checkoutMutation.checkoutLinesUpdate.errors);
          } else {
            // If checkout became null — reset cookie and context
            if (!response?.checkoutMutation?.checkoutLinesUpdate?.checkout) {
              cartIdUtils.removeCartIdCookie();
              setCartKey(null);
            } else {
              setCartKey(response.checkoutMutation.checkoutLinesUpdate.checkout);
            }
            resolve(response?.checkoutMutation?.checkoutLinesUpdate?.checkout);
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
