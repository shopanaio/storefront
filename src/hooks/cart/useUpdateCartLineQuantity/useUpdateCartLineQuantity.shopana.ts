import useCart from "../useCart";
import { useCartContext } from "@src/providers/cart-context";
import { graphql, useMutation } from "react-relay";
//import { CartLineQuantityMutation } from "@src/relay/queries/CartLineQuantityMutation.shopana";
import { useUpdateCartLineQuantityMutation as CartLineQuantityMutationType } from "@src/hooks/cart/useUpdateCartLineQuantity/__generated__/useUpdateCartLineQuantityMutation.graphql";
import cartIdUtils from "@src/utils/cartId";
import {
  applyAggregateDelta,
  updateLineCostForQuantity,
} from "@src/hooks/cart/utils/optimisticCheckout";

export const useUpdateCartLineQuantityMutation = graphql`
  mutation useUpdateCartLineQuantityMutation(
    $input: CheckoutLinesUpdateInput!
  ) {
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
  const [commit, isInFlight] = useMutation<CartLineQuantityMutationType>(
    useUpdateCartLineQuantityMutation
  );

  const updateQuantity = async (
    { cartItemId, quantity }: { cartItemId: string; quantity: number },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
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
            lines: [
              {
                lineId: cartItemId,
                quantity,
              },
            ],
          },
        },
        optimisticUpdater: (store) => {
          if (!cart?.id) {
            return;
          }

          const checkoutRecord = store.get(cart.id);
          if (!checkoutRecord) {
            return;
          }

          const lines = checkoutRecord.getLinkedRecords("lines") ?? [];
          const targetLine = lines.find(
            (lineRecord) => lineRecord.getValue("id") === cartItemId
          );

          if (!targetLine) {
            return;
          }

          const {
            oldQuantity,
            newQuantity,
            oldSubtotal,
            newSubtotal,
            oldTotal,
            newTotal,
          } = updateLineCostForQuantity(targetLine, quantity);

          applyAggregateDelta(checkoutRecord, {
            quantityDelta: newQuantity - oldQuantity,
            subtotalDelta: newSubtotal - oldSubtotal,
            totalDelta: newTotal - oldTotal,
            discountDelta:
              (newSubtotal - newTotal) - (oldSubtotal - oldTotal),
          });

          if (newQuantity <= 0) {
            const filtered = lines.filter((line) => line !== targetLine);
            checkoutRecord.setLinkedRecords(filtered, "lines");
          }
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            options?.onError?.();
            return reject(errors);
          } else if (
            response?.checkoutMutation?.checkoutLinesUpdate?.errors &&
            response.checkoutMutation.checkoutLinesUpdate.errors.length > 0
          ) {
            options?.onError?.();
            return reject(response.checkoutMutation.checkoutLinesUpdate.errors);
          } else {
            // If checkout became null — reset cookie and context
            if (!response?.checkoutMutation?.checkoutLinesUpdate?.checkout) {
              cartIdUtils.removeCartIdCookie();
              setCartKey(null);
            } else {
              setCartKey(
                response.checkoutMutation.checkoutLinesUpdate.checkout
              );
            }
            options?.onSuccess?.();
            return resolve(
              response?.checkoutMutation?.checkoutLinesUpdate?.checkout
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

  return { updateQuantity, loading: isInFlight };
};

export default useUpdateCartLineQuantity;
