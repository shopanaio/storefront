'use client';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { addToCartMutation } from '../../core/graphql/mutations/addToCartMutation';
import {
  useCartActions,
  useCartConfig,
  useCartStoreApi,
} from '../context/CartContext';
import useCreateCart from './useCreateCart';
import type { AddToCartInput } from '../../core/types';
const useAddItemToCart = () => {
  const { createCart } = useCreateCart();
  const cartStore = useCartStoreApi();
  const actions = useCartActions();
  const { defaultLocale } = useCartConfig();
  const [commitAddLine, isInFlight] = useMutation(addToCartMutation);
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
      const { checkoutLinesAdd } = actions;
      const cartId = cartStore.cart?.id ?? null;

      if (!cartId) {
        return createCart(
          {
            currencyCode: purchasableSnapshot.price.currencyCode,
            localeCode: defaultLocale,
            items: [
              {
                purchasableId,
                quantity,
                tagSlug: input.tagSlug,
                children: input.children,
              },
            ],
            tags: input.tags,
          },
          options
        );
      }
      const { revert } = checkoutLinesAdd({
        lines: [
          {
            purchasableId,
            quantity,
            children: input.children,
          },
        ],
        pricing: {
          [purchasableId]: {
            unitPrice: purchasableSnapshot.price.amount,
            compareAtUnitPrice: purchasableSnapshot.compareAtPrice?.amount,
            currencyCode: purchasableSnapshot.price.currencyCode,
          },
        },
      });
      return new Promise((resolve, reject) => {
        commitAddLine({
          variables: {
            input: {
              checkoutId: cartId,
              lines: [
                {
                  purchasableId,
                  quantity,
                  tagSlug: input.tagSlug,
                  children: input.children?.map((child) => ({
                    componentItemId: child.componentItemId,
                    purchasableId: child.purchasableId,
                    quantity: child.quantity,
                    attributes: child.attributes,
                  })),
                },
              ],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              onError?.();
              return reject(errors);
            }
            if (response.checkoutLinesAdd.errors.length > 0) {
              revert();
              onError?.();
              return reject(response.checkoutLinesAdd.errors);
            }
            onSuccess?.();
            return resolve(response.checkoutLinesAdd.checkout);
          },
          onError: (error) => {
            revert();
            onError?.();
            reject(error);
          },
        });
      });
    },
    isInFlight,
  };
};
export default useAddItemToCart;
