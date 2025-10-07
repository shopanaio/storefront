import { graphql } from "react-relay";

export const removeDeliveryRecipientsMutation = graphql`
  mutation removeDeliveryRecipientsMutation(
    $input: CheckoutDeliveryRecipientsRemoveInput!
  ) {
    checkoutMutation {
      checkoutDeliveryRecipientsRemove(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
