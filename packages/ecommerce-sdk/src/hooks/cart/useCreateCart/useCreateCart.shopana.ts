import { ApiCheckoutCreateInput } from '@codegen/schema-client';
import { graphql, useMutation } from 'react-relay';
import { useCreateCartMutation as CreateCartMutationType } from '@src/hooks/cart/useCreateCart/__generated__/useCreateCartMutation.graphql';
import { useCartContext } from '@src/providers/cart-context';

export const useCreateCartMutation = graphql`
  mutation useCreateCartMutation($input: CheckoutCreateInput!) {
    checkoutMutation {
      checkoutCreate(input: $input) {
        id
        ...useCart_CartFragment
      }
    }
  }
`;

const useCreateCart = () => {
  const { setId, setCartKey } = useCartContext();
  const [commit, isInFlight] = useMutation<CreateCartMutationType>(
    useCreateCartMutation
  );

  const createCart = (
    input: ApiCheckoutCreateInput,
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
