import useCart from "../useCart";
import { useCurrencyStore } from "@src/store/appStore";
import { useMutation, graphql } from "react-relay";
import { useCartContext } from "@src/providers/cart-context";
import useCreateCart from "@src/hooks/cart/useCreateCart";
import { AddToCartInput } from "./index";
import cartIdUtils from "@src/utils/cartId";

// Define correct Shopify mutation for adding products to cart
const useAddItemToCartMutation = graphql`
  mutation useAddItemToCartMutation($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ... useCart_CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const useAddItemToCart = () => {
  const { cart } = useCart();
  const currencyCode = useCurrencyStore((state) => state.currencyCode);
  const { createCart } = useCreateCart();

  const [commit, isInFlight] = useMutation(useAddItemToCartMutation);

  const addToCartInternal = async (input: AddToCartInput) => {
    const cartId = cartIdUtils.getCartIdFromCookie();

    if (!cartId) {
      throw new Error("No cart ID found");
    }

    // In Shopify use variantId from product if exists, otherwise productId
    const merchandiseId = input.product.variants?.[0]?.id || input.product.id;

    return new Promise((resolve, reject) => {
      commit({
        variables: {
          cartId,
          lines: [
            {
              merchandiseId,
              quantity: input.quantity,
              attributes: input.attributes || [],
            },
          ],
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            console.error("Add to cart errors:", errors);
            reject(new Error(errors[0].message));
            return;
          }

          if (
            response?.cartLinesAdd?.userErrors &&
            response.cartLinesAdd.userErrors.length > 0
          ) {
            console.error("Add to cart user errors:", response.cartLinesAdd.userErrors);
            reject(new Error(response.cartLinesAdd.userErrors[0].message));
            return;
          }

          if (response?.cartLinesAdd?.cart) {
            resolve(response.cartLinesAdd.cart);
          } else {
            reject(new Error("No cart returned from add to cart"));
          }
        },
        onError: (error) => {
          console.error("Add to cart error:", error);
          reject(error);
        },
      });
    });
  };

  return {
    addToCart: async (input: AddToCartInput) => {
      try {
        // Check if cart exists
        if (!cart) {
          console.log("Creating new cart with currency:", currencyCode);
          const newCart = await createCart({
            currencyCode,
            items: [], // Create empty cart
          });

          if (!newCart) {
            throw new Error("Failed to create cart");
          }

          // After creating cart add product
          return addToCartInternal(input);
        }

        // If cart already exists, add product
        return addToCartInternal(input);
      } catch (error) {
        console.error("Error adding item to cart:", error);
        throw error;
      }
    },
    isInFlight,
  };
};

export default useAddItemToCart;
