"use client";

import { useMutation } from 'react-relay';
import type {
  createCartMutation as CreateCartMutationType,
  CurrencyCode,
  LocaleCode,
} from '../../core/graphql/mutations/__generated__/createCartMutation.graphql';
import { createCartMutation } from '../../core/graphql/mutations/createCartMutation';
import { useCartConfig, useCartContext } from '../context/CartContext';
import type { CreateCartInput } from '../../core/types';
import { createCheckoutIdempotencyKey } from '../../core/utils/idempotencyKey';

type CreatedCheckout =
  CreateCartMutationType['response']['checkoutCreate']['checkout'];

const useCreateCart = () => {
  const { setId, setCartKey } = useCartContext();
  const { channelCode } = useCartConfig();
  const [commit, isInFlight] = useMutation<CreateCartMutationType>(
    createCartMutation
  );

  const createCart = (
    input: CreateCartInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ): Promise<CreatedCheckout> => {
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            channelCode,
            currencyCode: input.currencyCode as CurrencyCode,
            localeCode: input.localeCode as LocaleCode,
            idempotencyKey: createCheckoutIdempotencyKey(),
            tags: input.tags,
            items: input.items.map((item) => ({
              purchasableId: item.purchasableId,
              quantity: item.quantity,
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
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            options?.onError?.();
            return reject(errors);
          }

          if (response.checkoutCreate.errors.length > 0) {
            options?.onError?.();
            return reject(response.checkoutCreate.errors);
          }

          const checkout = response.checkoutCreate.checkout;
          if (!checkout) {
            options?.onError?.();
            return reject(new Error('No cart found in checkoutCreate response'));
          }

          setId(checkout.id);
          setCartKey(checkout);
          options?.onSuccess?.();
          return resolve(checkout);
        },
        onError: (error) => {
          options?.onError?.();
          reject(error);
        },
      });
    });
  };

  return { createCart, isLoading: isInFlight };
};

export default useCreateCart;
