import { graphql } from "react-relay";

export const selectDeliveryMethodMutation = graphql`
  mutation selectDeliveryMethodMutation(
    $input: CheckoutDeliveryMethodUpdateInput!
  ) {
    checkoutMutation {
      checkoutDeliveryMethodUpdate(input: $input) {
        ...useCart_CartFragment
      }
    }
  }
`;
