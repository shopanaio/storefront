'use client';
import { useCartSetters } from '../context/CartContext';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { addToCartMutation } from '../../core/graphql/mutations/addToCartMutation';
import {
  useCartActions,
  useCartIdUtils,
  useCartLocalization,
  useCartStoreApi,
} from '../context/CartContext';
import useCreateCart from './useCreateCart';
import type { AddToCartInput, MutationOptions } from '../../core/types';
import type { model } from '../../../../model/namespace';
import {
  cartUserError,
  missingCheckoutError,
  settleCartMutation,
} from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useAddItemToCart = () => {
  const { setCartKey, enqueueMutation } = useCartSetters();
  const { createCart } = useCreateCart();
  const cartStore = useCartStoreApi();
  const cartIdUtils = useCartIdUtils();
  const actions = useCartActions();
  const localization = useCartLocalization();
  const [commitAddLine, isInFlight] = useMutation(addToCartMutation);
  return {
    /** Resolves with the confirmed cart; rejects only with `CartMutationError`. */
    addToCart: async (
      input: AddToCartInput,
      options?: MutationOptions
    ): Promise<model.Cart> => {
      const { purchasableId, purchasableSnapshot, quantity } = input;
      const { checkoutLinesAdd } = actions;
      // A cart that is still loading or failed to load keeps its cookie: the line goes there,
      // and only a shopper without a cart gets a new one.
      const cartId = cartStore.cart?.id ?? cartIdUtils.getCartIdFromCookie();

      if (!cartId) {
        return createCart(
          {
            currencyCode: localization.currencyCode,
            localeCode: localization.languageCode,
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
      return settleCartMutation(
        enqueueMutation(
          () =>
            new Promise<model.Cart>((resolve, reject) => {
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
                onCompleted: (response) => {
                  const payload = response.checkoutLinesAdd;
                  if (payload.errors.length > 0) {
                    return reject(cartUserError(payload.errors));
                  }
                  if (!payload.checkout) {
                    return reject(missingCheckoutError('checkoutLinesAdd'));
                  }
                  setCartKey(payload.checkout);
                  return resolve(
                    mapShopanaCheckoutToEntityCart(payload.checkout)
                  );
                },
                onError: reject,
              });
            }),
          { optimisticEdit }
        ),
        options
      );
    },
    isInFlight,
  };
};
export default useAddItemToCart;
