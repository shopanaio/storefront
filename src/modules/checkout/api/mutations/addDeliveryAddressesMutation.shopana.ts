import { graphql } from "react-relay";

export const addDeliveryAddressesMutation = graphql`
  mutation addDeliveryAddressesMutation(
    $input: CheckoutDeliveryAddressesAddInput!
  ) {
    checkoutDeliveryAddressesAdd(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
