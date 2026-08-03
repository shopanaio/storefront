import { graphql } from 'react-relay';

export const updateDeliveryAddressesMutation = graphql`
  mutation updateDeliveryAddressesMutation(
    $input: CheckoutDeliveryAddressesUpdateInput!
  ) {
    checkoutDeliveryAddressesUpdate(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
