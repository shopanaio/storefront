import { graphql } from 'react-relay';

export const removePromoCodeMutation = graphql`
  mutation removePromoCodeMutation($input: CheckoutPromoCodeRemoveInput!) {
    checkoutPromoCodeRemove(input: $input) {
      checkout {
        ...useCheckoutFragment
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
