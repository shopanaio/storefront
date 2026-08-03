import { graphql } from "react-relay";

export const addDeliveryRecipientsMutation = graphql`
  mutation addDeliveryRecipientsMutation(
    $input: CheckoutDeliveryRecipientsAddInput!
  ) {
    checkoutDeliveryRecipientsAdd(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
