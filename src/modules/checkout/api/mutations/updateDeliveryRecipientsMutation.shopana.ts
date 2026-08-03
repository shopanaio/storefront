import { graphql } from "react-relay";

export const updateDeliveryRecipientsMutation = graphql`
  mutation updateDeliveryRecipientsMutation(
    $input: CheckoutDeliveryRecipientsUpdateInput!
  ) {
    checkoutDeliveryRecipientsUpdate(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
