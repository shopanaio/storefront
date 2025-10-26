import useCart from "../useCart";
import { useCurrencyStore } from "@src/store/appStore";
import { graphql, useMutation } from "react-relay";
import { useAddItemToCartMutation as AddCartLineMutationType } from "@src/hooks/cart/useAddItemToCart/__generated__/useAddItemToCartMutation.graphql";

import { useCartContext } from "@src/providers/cart-context";
import useCreateCart from "@src/hooks/cart/useCreateCart";
import { AddToCartInput } from "./interface";
import { useLocale } from "next-intl";
import {
  applyAggregateDelta,
  createCheckoutLineRecord,
  getCheckoutCurrency,
  getVariantPricing,
  updateLineCostForQuantity,
} from "@src/hooks/cart/utils/optimisticCheckout";

export const useAddItemToCartMutation = graphql`
  mutation useAddItemToCartMutation($input: CheckoutLinesAddInput!) {
    checkoutMutation {
      checkoutLinesAdd(input: $input) {
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

const useAddItemToCart = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();
  const { createCart } = useCreateCart();
  const currencyCode = useCurrencyStore((state) => state.currencyCode);
  const [localeCode] = useLocale();
  const [commitAddLine, isInFlight] = useMutation<AddCartLineMutationType>(
    useAddItemToCartMutation
  );

  return {
    addToCart: async (
      input: AddToCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<unknown> => {
      // If no cart — create new one
      if (!cart?.id) {
        const newCart = await createCart(
          {
            currencyCode,
            localeCode,
            items: [
              {
                purchasableId: input.purchasableId,
                quantity: input.quantity,
              },
            ],
          },
          options
        );
        // Update context with new cart key
        if (newCart) {
          setCartKey(newCart);
        }
        return newCart;
      }

      // If cart exists — add product through mutation
      return new Promise((resolve, reject) => {
        commitAddLine({
          variables: {
            input: {
              checkoutId: cart.id,
              lines: [
                {
                  purchasableId: input.purchasableId,
                  quantity: input.quantity,
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
            const existingLine = lines.find((line) => {
              const linePurchasableId = line.getValue("purchasableId");
              return linePurchasableId === input.purchasableId;
            });

            if (existingLine) {
              const currentQuantity =
                (existingLine.getValue("quantity") as number) ?? 0;
              const targetQuantity = currentQuantity + input.quantity;

              const {
                oldQuantity,
                newQuantity,
                oldSubtotal,
                newSubtotal,
                oldTotal,
                newTotal,
              } = updateLineCostForQuantity(existingLine, targetQuantity);

              applyAggregateDelta(checkoutRecord, {
                quantityDelta: newQuantity - oldQuantity,
                subtotalDelta: newSubtotal - oldSubtotal,
                totalDelta: newTotal - oldTotal,
                discountDelta:
                  (newSubtotal - newTotal) - (oldSubtotal - oldTotal),
              });
              return;
            }

            const variantRecord = store.get(input.purchasableId);
            const variantPricing = getVariantPricing(variantRecord);
            const checkoutCurrency =
              getCheckoutCurrency(checkoutRecord) ??
              cart?.cost.totalAmount.currencyCode ??
              variantPricing.currencyCode ??
              currencyCode ??
              "USD";

            const unitPrice = variantPricing.priceAmount || 0;
            const compareAtUnitPrice =
              variantPricing.compareAtAmount || unitPrice;
            const subtotalAmount = unitPrice * input.quantity;
            const totalAmount = unitPrice * input.quantity;

            const createdLine = createCheckoutLineRecord({
              store,
              purchasableId: input.purchasableId,
              quantity: input.quantity,
              currencyCode: checkoutCurrency,
              unitPrice,
              compareAtUnitPrice,
              subtotalAmount,
              totalAmount,
              variantRecord,
              childQuantities: input.children?.map((child) => child.quantity),
            });

            checkoutRecord.setLinkedRecords(
              [...lines, createdLine.lineRecord],
              "lines"
            );

            applyAggregateDelta(checkoutRecord, {
              quantityDelta: createdLine.quantity,
              subtotalDelta: createdLine.subtotalAmount,
              totalDelta: createdLine.totalAmount,
              discountDelta: createdLine.discountAmount,
            });
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              options?.onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesAdd?.errors &&
              response.checkoutMutation.checkoutLinesAdd.errors.length > 0
            ) {
              options?.onError?.();
              return reject(response.checkoutMutation.checkoutLinesAdd.errors);
            } else {
              if (response?.checkoutMutation?.checkoutLinesAdd?.checkout) {
                // Update context cart with new data
                setCartKey(response.checkoutMutation.checkoutLinesAdd.checkout);
              }

              options?.onSuccess?.();
              return resolve(
                response?.checkoutMutation?.checkoutLinesAdd?.checkout
              );
            }
          },
          onError: (err) => {
            options?.onError?.();
            reject(err);
          },
        });
      });
    },
    isInFlight,
  };
};

export default useAddItemToCart;
