import { ApiCheckoutCreateInput } from "@codegen/schema-client";
import { graphql, useMutation } from "react-relay";
import { useCreateCartMutation as CreateCartMutationType } from "@src/hooks/cart/useCreateCart/__generated__/useCreateCartMutation.graphql";
import cartIdUtils from "@src/utils/cartId";

export const useCreateCartMutation = graphql`
  mutation useCreateCartMutation($input: CheckoutCreateInput!) {
    checkoutMutation {
      checkoutCreate(input: $input) {
        ...useCart_CartFragment
      }
    }
  }
`;

const useCreateCart = () => {
  const [commit, isInFlight] = useMutation<CreateCartMutationType>(
    useCreateCartMutation
  );

  const createCart = (
    input: ApiCheckoutCreateInput
  ): Promise<CreateCartMutationType["response"]["checkoutMutation"]["checkoutCreate"]> => {
    return new Promise((resolve, reject) => {
      commit({
        variables: { input },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            reject(errors);
          } else {
            const checkout = response?.checkoutMutation?.checkoutCreate;
            if (checkout && checkout) {
              // Save cart ID in cookie
              cartIdUtils.setCartIdCookie(checkout.id);
            }
            resolve(checkout);
          }
        },
        onError: (err) => {
          reject(err);
        },
      });
    });
  };

  return { createCart, isLoading: isInFlight };
};

export default useCreateCart;
