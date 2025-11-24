"use client";

import { useMutation } from 'react-relay';
import type { addToCartMutation as AddCartLineMutationType } from '../../core/graphql/mutations/__generated__/addToCartMutation.graphql';
import { addToCartMutation } from '../../core/graphql/mutations/addToCartMutation';

import { useCartActions, useCartConfig } from '../context';
import useCreateCart from './useCreateCart';
import useCart from './useCart';
import { AddToCartInput } from '../../core/types';

const useAddItemToCart = () => {
  const { createCart } = useCreateCart();
  const { cart } = useCart();
  const actions = useCartActions();
  const { defaultCurrency, defaultLocale } = useCartConfig();
  const [commitAddLine, isInFlight] = useMutation<AddCartLineMutationType>(
    addToCartMutation
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
      const { checkoutLinesAdd } = actions;

      // If no cart — create new one
      if (!cart?.id) {
        return await createCart(
          {
            currencyCode: purchasableSnapshot.price.currencyCode as any,
            localeCode: defaultLocale,
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
            currencyCode: purchasableSnapshot.price.currencyCode,
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
