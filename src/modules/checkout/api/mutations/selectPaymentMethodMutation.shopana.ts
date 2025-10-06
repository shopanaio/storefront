import { graphql } from "react-relay";

export const selectPaymentMethodMutation = graphql`
  mutation selectPaymentMethodMutation(
    $input: CheckoutPaymentMethodUpdateInput!
  ) {
    checkoutMutation {
      checkoutPaymentMethodUpdate(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
