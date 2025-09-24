import { graphql } from "react-relay";

export const clearCartLinesMutation = graphql`
  mutation clearCartLinesMutation($input: CheckoutLinesClearInput!) {
    checkoutMutation {
      checkoutLinesClear(input: $input) {
        checkout {
          ...useCart_CartFragment
        }
        errors {
          field
          message
        }
      }
    }
  }
`;
