import useCart from "../useCart";
import { useCurrencyStore } from "@src/store/appStore";
import { graphql, useMutation } from "react-relay";
import { useAddItemToCartMutation as AddCartLineMutationType } from "@src/hooks/cart/useAddItemToCart/__generated__/useAddItemToCartMutation.graphql";

import { useCartContext } from "@src/providers/cart-context";
import useCreateCart from "@src/hooks/cart/useCreateCart";
import { AddToCartInput } from "./index";

export const useAddItemToCartMutation = graphql`
  mutation useAddItemToCartMutation($input: AddCartLineInput!) {
    addCartLine(input: $input) {
      cart {
        ...useCart_CartFragment
      }
      errors {
        message
      }
    }
  }
`;

const useAddItemToCart = () => {
  const { cart } = useCart();
  const { setCartKey } = useCartContext();
  const { createCart } = useCreateCart();
  const currencyCode = useCurrencyStore((state) => state.currencyCode);
  const [commitAddLine] =
    useMutation<AddCartLineMutationType>(useAddItemToCartMutation);

  return {
    addToCart: async (input: AddToCartInput): Promise<any> => {
      const cartId = cart?.id;
      const productId = input.product.id; // Extract ID from product

      // If no cart — create new one
      if (!cartId || !cart?.id) {
        console.log("Creating new cart with currency:", currencyCode);
        const newCart = await createCart({
          currencyCode,
          items: [{ productId, quantity: input.quantity }],
        });
        console.log("New cart created:", newCart);
        // Update context with new cart key
        if (newCart) {
          setCartKey(newCart);
        }
        return newCart;
      }

      // If cart exists — add product through mutation
      console.log("Adding to existing cart:", cart.id);
      return new Promise<any>((resolve, reject) => {
        commitAddLine({
          variables: {
            input: {
              cartId: cart.id,
              productId, // Use extracted ID
              quantity: input.quantity,
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              reject(errors);
            } else if (
              response?.addCartLine?.errors &&
              response.addCartLine.errors.length > 0
            ) {
              reject(response.addCartLine.errors);
            } else {
              if (response?.addCartLine?.cart) {
                // Update context cart with new data
                setCartKey(response.addCartLine.cart);
              }

              resolve(response?.addCartLine?.cart);
            }
          },
          onError: (err) => {
            reject(err);
          },
        });
      });
    },
  };
};

export default useAddItemToCart;
