import { graphql } from "react-relay";

export const updateCustomerIdentityMutation = graphql`
  mutation updateCustomerIdentityMutation(
    $input: CheckoutCustomerIdentityUpdateInput!
  ) {
    checkoutCustomerIdentityUpdate(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
