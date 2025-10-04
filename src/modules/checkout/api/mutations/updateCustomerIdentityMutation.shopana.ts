import { graphql } from "react-relay";

export const updateCustomerIdentityMutation = graphql`
  mutation updateCustomerIdentityMutation(
    $input: CheckoutCustomerIdentityUpdateInput!
  ) {
    checkoutMutation {
      checkoutCustomerIdentityUpdate(input: $input) {
        ...useCart_CartFragment
      }
    }
  }
`;
