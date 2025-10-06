import { graphql } from 'react-relay';

export const updateDeliveryAddressesMutation = graphql`
  mutation updateDeliveryAddressesMutation(
    $input: CheckoutDeliveryAddressesUpdateInput!
  ) {
    checkoutMutation {
      checkoutDeliveryAddressesUpdate(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
