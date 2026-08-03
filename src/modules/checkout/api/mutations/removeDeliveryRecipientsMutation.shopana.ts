import { graphql } from "react-relay";

export const removeDeliveryRecipientsMutation = graphql`
  mutation removeDeliveryRecipientsMutation(
    $input: CheckoutDeliveryRecipientsRemoveInput!
  ) {
    checkoutDeliveryRecipientsRemove(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
