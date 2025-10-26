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
import {
  applyAggregateDelta,
  createCheckoutLineRecord,
  getCheckoutCurrency,
  getLineCostSummary,
  getVariantPricing,
  updateLineCostForQuantity,
} from "@src/hooks/cart/utils/optimisticCheckout";

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
        optimisticUpdater: (store) => {
          if (!cart?.id) {
            return;
          }

          const checkoutRecord = store.get(cart.id);
          if (!checkoutRecord) {
            return;
          }

          const lines = checkoutRecord.getLinkedRecords("lines") ?? [];
          const sourceLine = lines.find(
            (lineRecord) => lineRecord.getValue("id") === input.lineId
          );

          if (!sourceLine) {
            return;
          }

          const sourceSummary = getLineCostSummary(sourceLine);
          if (sourceSummary.quantity <= 0) {
            return;
          }

          const requestedQuantity =
            input.quantity === undefined
              ? sourceSummary.quantity
              : Math.min(Math.max(input.quantity, 0), sourceSummary.quantity);

          if (requestedQuantity <= 0) {
            return;
          }

          const remainingQuantity = sourceSummary.quantity - requestedQuantity;

          const {
            oldQuantity,
            newQuantity,
            oldSubtotal,
            newSubtotal,
            oldTotal,
            newTotal,
          } = updateLineCostForQuantity(sourceLine, remainingQuantity);

          applyAggregateDelta(checkoutRecord, {
            quantityDelta: newQuantity - oldQuantity,
            subtotalDelta: newSubtotal - oldSubtotal,
            totalDelta: newTotal - oldTotal,
            discountDelta:
              (newSubtotal - newTotal) - (oldSubtotal - oldTotal),
          });

          let updatedLines = lines;
          if (remainingQuantity <= 0) {
            updatedLines = lines.filter((line) => line !== sourceLine);
          }

          const variantRecord = store.get(input.purchasableId);
          const variantPricing = getVariantPricing(variantRecord);
          const checkoutCurrency =
            getCheckoutCurrency(checkoutRecord) ??
            sourceSummary.currencyCode ??
            variantPricing.currencyCode ??
            cart?.cost.totalAmount.currencyCode ??
            "USD";

          const unitTotal =
            variantPricing.priceAmount || sourceSummary.unitTotal || 0;
          const unitSubtotal =
            variantPricing.compareAtAmount ||
            sourceSummary.unitSubtotal ||
            unitTotal;

          const subtotalAmount = unitSubtotal * requestedQuantity;
          const totalAmount = unitTotal * requestedQuantity;

          const newLine = createCheckoutLineRecord({
            store,
            purchasableId: input.purchasableId,
            quantity: requestedQuantity,
            currencyCode: checkoutCurrency,
            unitPrice: unitTotal,
            compareAtUnitPrice: unitSubtotal,
            subtotalAmount,
            totalAmount,
            variantRecord,
          });

          const nextLines = [...updatedLines, newLine.lineRecord];
          checkoutRecord.setLinkedRecords(nextLines, "lines");

          applyAggregateDelta(checkoutRecord, {
            quantityDelta: newLine.quantity,
            subtotalDelta: newLine.subtotalAmount,
            totalDelta: newLine.totalAmount,
            discountDelta: newLine.discountAmount,
          });
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
