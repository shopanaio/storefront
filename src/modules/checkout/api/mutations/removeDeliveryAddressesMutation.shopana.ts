import { graphql } from 'react-relay';

export const removeDeliveryAddressesMutation = graphql`
  mutation removeDeliveryAddressesMutation(
    $input: CheckoutDeliveryAddressesRemoveInput!
  ) {
    checkoutDeliveryAddressesRemove(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
