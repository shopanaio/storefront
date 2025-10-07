import { graphql } from "react-relay";

export const updateDeliveryRecipientsMutation = graphql`
  mutation updateDeliveryRecipientsMutation(
    $input: CheckoutDeliveryRecipientsUpdateInput!
  ) {
    checkoutMutation {
      checkoutDeliveryRecipientsUpdate(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
