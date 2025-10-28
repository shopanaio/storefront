import useCart from '../useCart';
import { useCartContext } from '@src/providers/cart-context';
import { graphql, useMutation } from 'react-relay';
//import { CartLineQuantityMutation } from "@src/relay/queries/CartLineQuantityMutation.shopana";
import { useUpdateCartLineQuantityMutation as CartLineQuantityMutationType } from '@src/hooks/cart/useUpdateCartLineQuantity/__generated__/useUpdateCartLineQuantityMutation.graphql';
import cartIdUtils from '@src/utils/cartId';
import { useCartStore } from '@src/store/cartStore';

export const useUpdateCartLineQuantityMutation = graphql`
  mutation useUpdateCartLineQuantityMutation(
    $input: CheckoutLinesUpdateInput!
  ) {
    checkoutMutation {
      checkoutLinesUpdate(input: $input) {
        checkout {
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

const useUpdateCartLineQuantity = () => {
  const [commit, isInFlight] = useMutation<CartLineQuantityMutationType>(
    useUpdateCartLineQuantityMutation
  );

  const updateQuantity = async (
    { cartItemId, quantity }: { cartItemId: string; quantity: number },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const { cart } = useCartStore.getState();
    if (!cart?.id) {
      console.warn('[useUpdateCartLineQuantity] No cart to update');
      return null;
    }
    const z = useCartStore.getState();
    const { revert } = z.checkoutLinesUpdate({
      lines: [{ lineId: cartItemId, quantity }],
    });
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            checkoutId: cart.id,
            lines: [
              {
                lineId: cartItemId,
                quantity,
              },
            ],
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            revert();
            options?.onError?.();
            return reject(errors);
          } else if (
            response?.checkoutMutation?.checkoutLinesUpdate?.errors &&
            response.checkoutMutation.checkoutLinesUpdate.errors.length > 0
          ) {
            revert();
            options?.onError?.();
            return reject(response.checkoutMutation.checkoutLinesUpdate.errors);
          } else {
            options?.onSuccess?.();
            return resolve(
              response?.checkoutMutation?.checkoutLinesUpdate?.checkout
            );
          }
        },
        onError: (err) => {
          revert();
          options?.onError?.();
          return reject(err);
        },
      });
    });
  };

  return { updateQuantity, loading: isInFlight };
};

export default useUpdateCartLineQuantity;
