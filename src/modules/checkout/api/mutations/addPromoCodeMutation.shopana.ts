import { graphql } from "react-relay";

export const addPromoCodeMutation = graphql`
  mutation addPromoCodeMutation($input: CheckoutPromoCodeAddInput!) {
    checkoutPromoCodeAdd(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
