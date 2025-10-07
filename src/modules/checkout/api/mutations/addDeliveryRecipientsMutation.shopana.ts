import { graphql } from "react-relay";

export const addDeliveryRecipientsMutation = graphql`
  mutation addDeliveryRecipientsMutation(
    $input: CheckoutDeliveryRecipientsAddInput!
  ) {
    checkoutMutation {
      checkoutDeliveryRecipientsAdd(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
