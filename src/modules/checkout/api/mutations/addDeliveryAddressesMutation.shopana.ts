import { graphql } from "react-relay";

export const addDeliveryAddressesMutation = graphql`
  mutation addDeliveryAddressesMutation(
    $input: CheckoutDeliveryAddressesAddInput!
  ) {
    checkoutMutation {
      checkoutDeliveryAddressesAdd(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
