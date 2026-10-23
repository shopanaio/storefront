'use client';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import type {
  CheckoutLinePurchaseType,
  CurrencyCode,
  LocaleCode,
} from '../../../../graphql/apollo/generated/operations';
import { createCartMutation } from '../../core/graphql/mutations/createCartMutation';
import { useCartConfig, useCartSetters } from '../context/CartContext';
import type { CreateCartInput, MutationOptions } from '../../core/types';
import type { model } from '../../../../model/namespace';
import {
  cartUserError,
  missingCheckoutError,
  settleCartMutation,
} from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useCreateCart = () => {
  const { setId, setCartKey } = useCartSetters();
  const { channelCode } = useCartConfig();
  const [commit, isInFlight] = useMutation(createCartMutation);
  /** Resolves with the new cart; rejects only with `CartMutationError`. */
  const createCart = (
    input: CreateCartInput,
    options?: MutationOptions
  ): Promise<model.Cart> => {
    const write = new Promise<model.Cart>((resolve, reject) => {
      commit({
        variables: {
          input: {
            channelCode,
            currencyCode: input.currencyCode as CurrencyCode,
            localeCode: input.localeCode as LocaleCode,
            tags: input.tags,
            items: input.items.map((item) => ({
              purchasableId: item.purchasableId,
              quantity: item.quantity,
              purchase: item.purchase
                ? { type: item.purchase.type as CheckoutLinePurchaseType }
                : undefined,
              attributes: item.attributes,
              tagSlug: item.tagSlug,
              children: item.children?.map((child) => ({
                componentItemId: child.componentItemId,
                purchasableId: child.purchasableId,
                quantity: child.quantity,
                attributes: child.attributes,
              })),
            })),
          },
        },
        onCompleted: (response) => {
          const payload = response.checkoutCreate;
          if (payload.errors.length > 0) {
            return reject(cartUserError(payload.errors));
          }
          const checkout = payload.checkout;
          if (!checkout) {
            return reject(missingCheckoutError('checkoutCreate'));
          }
          setId(checkout.id);
          setCartKey(checkout);
          return resolve(mapShopanaCheckoutToEntityCart(checkout));
        },
        onError: reject,
      });
    });
    return settleCartMutation(write, options);
  };
  return { createCart, isLoading: isInFlight };
};
export default useCreateCart;
