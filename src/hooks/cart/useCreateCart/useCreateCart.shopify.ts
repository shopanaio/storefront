import { ApiCreateCartInput } from "@codegen/schema-client";
import { useMutation, graphql } from "react-relay";
import { useCreateCartMutation as CreateCartMutationType } from "@src/hooks/cart/useCreateCart/__generated__/useCreateCartMutation.graphql";
import cartIdUtils from "@src/utils/cartId";


const useCreateCartMutation = graphql`
  mutation useCreateCartMutation($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ... useCart_CartFragment
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const useCreateCart = () => {
  const [commit, isInFlight] = useMutation<CreateCartMutationType>(useCreateCartMutation);

  const createCart = (input: ApiCreateCartInput): Promise<CreateCartMutationType["response"]["cartCreate"]["cart"]> => {
    // In Shopify create empty cart without products
    const shopifyInput = {
      buyerIdentity: input.currencyCode ? {
        countryCode: input.currencyCode === 'USD' ? 'US' :
          input.currencyCode === 'EUR' ? 'EU' :
            input.currencyCode === 'UAH' ? 'UA' : 'US'
      } : undefined,
    };

    console.log("Creating empty cart with Shopify input:", shopifyInput);

    return new Promise((resolve, reject) => {
      commit({
        variables: { input: shopifyInput },
        onCompleted: (response: any, errors: any) => {
          console.log("Cart creation response:", response);
          console.log("Cart creation errors:", errors);

          if (errors && errors.length > 0) {
            console.error("GraphQL errors:", errors);
            reject(errors);
          } else if (response?.cartCreate?.userErrors && response.cartCreate.userErrors.length > 0) {
            console.error("Shopify user errors:", response.cartCreate.userErrors);
            reject(response.cartCreate.userErrors);
          } else {
            // Direct data access through any
            const cartData = response?.cartCreate?.cart;
            console.log("Cart data from response:", cartData);

            if (cartData && cartData.id) {
              // Save cart ID in cookie
              cartIdUtils.setCartIdCookie(cartData.id);
              console.log("Cart ID saved to cookie:", cartData.id);
              resolve(cartData);
            } else {
              console.error("No cart data found in response");
              console.error("Response structure:", JSON.stringify(response, null, 2));

              // Try to find cart another way
              const responseAny = response as any;
              if (responseAny?.cartCreate?.cart) {
                const cart = responseAny.cartCreate.cart;
                console.log("Found cart through alternative access:", cart);
                if (cart.id) {
                  cartIdUtils.setCartIdCookie(cart.id);
                  resolve(cart);
                  return;
                }
              }

              reject(new Error("No cart returned from Shopify"));
            }
          }
        },
        onError: (err) => {
          console.error("Cart creation error:", err);
          reject(err);
        },
      });
    });
  };

  return { createCart, isLoading: isInFlight };
};

export default useCreateCart;
