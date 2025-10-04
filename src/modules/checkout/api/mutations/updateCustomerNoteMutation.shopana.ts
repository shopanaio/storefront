import { graphql } from "react-relay";

export const updateCustomerNoteMutation = graphql`
  mutation updateCustomerNoteMutation(
    $input: CheckoutCustomerNoteUpdateInput!
  ) {
    checkoutMutation {
      checkoutCustomerNoteUpdate(input: $input) {
        ...useCart_CartFragment
      }
    }
  }
`;
