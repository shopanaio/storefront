import { useCurrencyStore } from '@src/store/appStore';
import { graphql, useMutation } from 'react-relay';
import { useAddItemToCartMutation as AddCartLineMutationType } from '@src/hooks/cart/useAddItemToCart/__generated__/useAddItemToCartMutation.graphql';

import { useCartContext } from '@src/providers/cart-context';
import useCreateCart from '@src/hooks/cart/useCreateCart';
import { AddToCartInput } from './interface';
import { useLocale } from 'next-intl';
import { useCartStore } from '@src/store/cartStore';

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
      const { purchasableId, purchasableSnapshot, quantity } = input;
      const { onError, onSuccess } = options || {};
      const { cart, checkoutLinesAdd } = useCartStore.getState();

      // If no cart — create new one
      if (!cart?.id) {
        return await createCart(
          {
            currencyCode,
            localeCode,
            items: [
              {
                purchasableId,
                quantity,
              },
            ],
          },
          options
        );
      }

      // If cart exists — add product through mutation

      const { revert } = checkoutLinesAdd({
        lines: [
          {
            purchasableId: purchasableId,
            quantity: quantity,
          },
        ],
        pricing: {
          [purchasableId]: {
            unitPrice: purchasableSnapshot.price.amount,
            compareAtUnitPrice: purchasableSnapshot.compareAtPrice?.amount,
            currencyCode,
          },
        },
      });

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
          // no Relay optimistic updater — Zustand обеспечивает мгновенный UI
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesAdd?.errors &&
              response.checkoutMutation.checkoutLinesAdd.errors.length > 0
            ) {
              revert();
              onError?.();
              return reject(response.checkoutMutation.checkoutLinesAdd.errors);
            } else {
              onSuccess?.();
              return resolve(
                response?.checkoutMutation?.checkoutLinesAdd?.checkout
              );
            }
          },
          onError: (err) => {
            revert();
            onError?.();
            reject(err);
          },
        });
      });
    },
    isInFlight,
  };
};

export default useAddItemToCart;
