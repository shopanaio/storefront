"use client";

import { useMutation } from 'react-relay';
import type { addToCartMutation as AddCartLineMutationType } from '../../core/graphql/mutations/__generated__/addToCartMutation.graphql';
import { addToCartMutation } from '../../core/graphql/mutations/addToCartMutation';

import { useCartActions, useCartConfig } from '../context/CartContext';
import useCreateCart from './useCreateCart';
import { useCartIdOnly } from './useCartSelectors';
import { AddToCartInput } from '../../core/types';

const useAddItemToCart = () => {
  const { createCart } = useCreateCart();
  const cartId = useCartIdOnly();
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
      if (!cartId) {
        return await createCart(
          {
            currencyCode: purchasableSnapshot.price.currencyCode as any,
            localeCode: defaultLocale,
            items: [
              {
                purchasableId,
                quantity,
                tagSlug: input.tagSlug,
              },
            ],
            tags: input.tags,
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
              checkoutId: cartId,
              lines: [
                {
                  purchasableId: input.purchasableId,
                  quantity: input.quantity,
                  tagSlug: input.tagSlug,
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
