"use client";

import { useMutation } from 'react-relay';
import type { createCartMutation as CreateCartMutationType, CheckoutCreateInput } from '../../core/graphql/mutations/__generated__/createCartMutation.graphql';
import { createCartMutation } from '../../core/graphql/mutations/createCartMutation';
import { useCartContext } from '../context/CartContext';

const useCreateCart = () => {
  const { setId, setCartKey } = useCartContext();
  const [commit, isInFlight] = useMutation<CreateCartMutationType>(
    createCartMutation
  );

  const createCart = (
    input: CheckoutCreateInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ): Promise<
    CreateCartMutationType['response']['checkoutMutation']['checkoutCreate']
  > => {
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input,
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            options?.onError?.();
            return reject(errors);
          } else {
            const checkout = response?.checkoutMutation?.checkoutCreate;
            if (!checkout?.id) {
              alert('No cart ID found in response');
            }
            if (checkout) {
              setId(checkout.id);
              setCartKey(checkout);
            }
            options?.onSuccess?.();
            return resolve(checkout);
          }
        },
        onError: (err) => {
          options?.onError?.();
          reject(err);
        },
      });
    });
  };

  return { createCart, isLoading: isInFlight };
};

export default useCreateCart;
