import { graphql } from "react-relay";

export const updateCustomerNoteMutation = graphql`
  mutation updateCustomerNoteMutation(
    $input: CheckoutCustomerNoteUpdateInput!
  ) {
    checkoutCustomerNoteUpdate(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
