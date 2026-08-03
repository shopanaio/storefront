import { graphql } from "react-relay";

export const selectDeliveryMethodMutation = graphql`
  mutation selectDeliveryMethodMutation(
    $input: CheckoutDeliveryMethodUpdateInput!
  ) {
    checkoutDeliveryMethodUpdate(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
