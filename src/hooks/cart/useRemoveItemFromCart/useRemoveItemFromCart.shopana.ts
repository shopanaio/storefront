import useCart from '../useCart';
import { useMutation, graphql } from 'react-relay';
import { useCartContext } from '@src/providers/cart-context';
import { RemoveFromCartInput } from './index';
import { useCartStore } from '@src/store/cartStore';

// Define mutation inside hook with correct name
export const useRemoveItemFromCartMutation = graphql`
  mutation useRemoveItemFromCartMutation($input: CheckoutLinesDeleteInput!) {
    checkoutMutation {
      checkoutLinesDelete(input: $input) {
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

const useRemoveItemFromCart = () => {
  const { cart } = useCart();

  const [commitRemoveLine, isInFlight] = useMutation<any>(
    useRemoveItemFromCartMutation
  );

  return {
    removeFromCart: async (
      input: RemoveFromCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
      const cartId = cart?.id;

      // If no cart in cookie or context — just exit
      if (!cartId || !cart?.id) {
        console.warn('[useRemoveItemFromCart] No cart to remove from');
        return null;
      }

      return new Promise((resolve, reject) => {
        const { checkoutLinesDelete } = useCartStore.getState();
        const { revert } = checkoutLinesDelete({ lineIds: [input.lineId] });
        commitRemoveLine({
          variables: {
            input: {
              checkoutId: cart.id,
              lineIds: [input.lineId],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              options?.onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesDelete?.errors &&
              response.checkoutMutation.checkoutLinesDelete.errors.length > 0
            ) {
              revert();
              options?.onError?.();
              return reject(
                response.checkoutMutation.checkoutLinesDelete.errors
              );
            } else {
              options?.onSuccess?.();
              return resolve(response);
            }
          },
          onError: (err) => {
            revert();
            options?.onError?.();
            return reject(err);
          },
        });
      });
    },
    loading: isInFlight,
  };
};

export default useRemoveItemFromCart;
