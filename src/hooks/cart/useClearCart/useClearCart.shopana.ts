import useCart from "../useCart";
import { useMutation } from "react-relay";
import { useCartContext } from "@src/providers/cart-context";
import { ClearCartInput, UseClearCartReturn } from "./interface";
import { clearCartLinesMutation } from "@src/relay/queries/clearCartLinesMutation.shopana";

const useClearCart = (): UseClearCartReturn => {
  const { cart } = useCart();
  const { setCartKey, setId } = useCartContext();

  const [commitClearCart, isInFlight] = useMutation<any>(clearCartLinesMutation);

  return {
    clearCart: async (
      input?: ClearCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
      const cartId = input?.checkoutId || cart?.id;

      // If no cart in cookie or context — just exit
      if (!cartId) {
        console.warn("[useClearCart] No cart to clear");
        return null;
      }

      return new Promise((resolve, reject) => {
        commitClearCart({
          variables: {
            input: {
              checkoutId: cartId,
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              options?.onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesClear?.errors &&
              response.checkoutMutation.checkoutLinesClear.errors.length > 0
            ) {
              options?.onError?.();
              return reject(
                response.checkoutMutation.checkoutLinesClear.errors
              );
            } else {
              // If checkout became null — remove cookie and clear context
              if (!response?.checkoutMutation?.checkoutLinesClear?.checkout) {
                setCartKey(null);
                setId(null);
              }
              options?.onSuccess?.();
              return resolve(response);
            }
          },
          onError: (err) => {
            options?.onError?.();
            return reject(err);
          },
        });
      });
    },
    loading: isInFlight,
  };
};

export default useClearCart;
