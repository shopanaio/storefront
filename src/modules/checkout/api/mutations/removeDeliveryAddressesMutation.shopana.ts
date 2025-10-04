import { graphql } from 'react-relay';

export const removeDeliveryAddressesMutation = graphql`
  mutation removeDeliveryAddressesMutation(
    $input: CheckoutDeliveryAddressesRemoveInput!
  ) {
    checkoutMutation {
      checkoutDeliveryAddressesRemove(input: $input) {
        ...useCart_CartFragment
      }
    }
  }
`;
