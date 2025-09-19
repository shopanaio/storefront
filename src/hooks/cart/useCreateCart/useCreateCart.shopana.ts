import { ApiCreateCartInput } from "@codegen/schema-client";
import { graphql, useMutation } from "react-relay";
import { useCreateCartMutation as CreateCartMutationType } from "@src/hooks/cart/useCreateCart/__generated__/useCreateCartMutation.graphql";
import cartIdUtils from "@src/utils/cartId";


export const useCreateCartMutation = graphql`
  mutation useCreateCartMutation($input: CreateCartInput!) {
    createCart(input: $input) {
      cart {
        ...useCart_CartFragment
      }
      errors {
        message
      }
    }
  }
`;

const useCreateCart = () => {
  const [commit, isInFlight] = useMutation<CreateCartMutationType>(useCreateCartMutation);

  const createCart = (input: ApiCreateCartInput): Promise<CreateCartMutationType["response"]["createCart"]["cart"]> => {
    return new Promise((resolve, reject) => {
      commit({
        variables: { input },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            reject(errors);
          } else if (response?.createCart?.errors && response.createCart.errors.length > 0) {
            reject(response.createCart.errors);
          } else {
            const cart = response?.createCart?.cart;
            if (cart && cart.id) {
              // Save cart ID in cookie
              cartIdUtils.setCartIdCookie(cart.id);
            }
            resolve(cart);
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
