import { graphql } from "react-relay";

export const selectPaymentMethodMutation = graphql`
  mutation selectPaymentMethodMutation(
    $input: CheckoutPaymentMethodUpdateInput!
  ) {
    checkoutPaymentMethodUpdate(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
