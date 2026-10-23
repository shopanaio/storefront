'use client';
import { useCartSetters } from '../context/CartContext';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { addToCartMutation } from '../../core/graphql/mutations/addToCartMutation';
import {
  useCartActions,
  useCartConfig,
  useCartIdUtils,
  useCartStoreApi,
} from '../context/CartContext';
import useCreateCart from './useCreateCart';
import type { AddToCartInput } from '../../core/types';
const useAddItemToCart = () => {
  const { setCartKey, enqueueMutation } = useCartSetters();
  const { createCart } = useCreateCart();
  const cartStore = useCartStoreApi();
  const cartIdUtils = useCartIdUtils();
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
      // A cart that is still loading or failed to load keeps its cookie: the line goes there,
      // and only a shopper without a cart gets a new one.
      const cartId = cartStore.cart?.id ?? cartIdUtils.getCartIdFromCookie();

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
      const optimisticEdit = () =>
        checkoutLinesAdd({
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
      return enqueueMutation(
        () =>
          new Promise((resolve, reject) => {
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
                  onError?.();
                  return reject(errors);
                }
                if (response.checkoutLinesAdd.errors.length > 0) {
                  onError?.();
                  return reject(response.checkoutLinesAdd.errors);
                }
                setCartKey(response.checkoutLinesAdd.checkout);
                onSuccess?.();
                return resolve(response.checkoutLinesAdd.checkout);
              },
              onError: (error) => {
                onError?.();
                reject(error);
              },
            });
          }),
        { optimisticEdit }
      );
    },
    isInFlight,
  };
};
export default useAddItemToCart;
