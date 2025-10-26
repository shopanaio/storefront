import useCart from "../useCart";
import { useMutation, graphql } from "react-relay";
import { useCartContext } from "@src/providers/cart-context";
import { RemoveFromCartInput } from "./index";
import {
  applyAggregateDelta,
  getLineCostSummary,
} from "@src/hooks/cart/utils/optimisticCheckout";

// Define mutation inside hook with correct name
export const useRemoveItemFromCartMutation = graphql`
  mutation useRemoveItemFromCartMutation($input: CheckoutLinesDeleteInput!) {
    checkoutMutation {
      checkoutLinesDelete(input: $input) {
        checkout {
          id
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
  const { setCartKey, setId } = useCartContext();

  const [commitRemoveLine, isInFlight] = useMutation<any>(
    useRemoveItemFromCartMutation
  );

  return {
    removeFromCart: async (
      input: RemoveFromCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
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
              lineIds: [input.lineId],
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
              (lineRecord) => lineRecord.getValue("id") === input.lineId
            );

            if (!targetLine) {
              return;
            }

            const summary = getLineCostSummary(targetLine);

            applyAggregateDelta(checkoutRecord, {
              quantityDelta: -summary.quantity,
              subtotalDelta: -summary.subtotalAmount,
              totalDelta: -summary.totalAmount,
              discountDelta: -summary.discountAmount,
            });

            const filteredLines = lines.filter((line) => line !== targetLine);
            checkoutRecord.setLinkedRecords(filteredLines, "lines");
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              options?.onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesDelete?.errors &&
              response.checkoutMutation.checkoutLinesDelete.errors.length > 0
            ) {
              options?.onError?.();
              return reject(
                response.checkoutMutation.checkoutLinesDelete.errors
              );
            } else {
              // If checkout became null — remove cookie and clear context
              if (!response?.checkoutMutation?.checkoutLinesDelete?.checkout) {
                setCartKey(null);
                setId(null);
              }
              options?.onSuccess?.();
              return resolve(response);
            }
          },
          onError: (err) => {
            options?.onError?.();
            return reject(err);
          },
        });
      });
    },
    loading: isInFlight,
  };
};

export default useRemoveItemFromCart;
