import { graphql } from 'react-relay';

export const removePromoCodeMutation = graphql`
  mutation removePromoCodeMutation($input: CheckoutPromoCodeRemoveInput!) {
    checkoutMutation {
      checkoutPromoCodeRemove(input: $input) {
        ...useCheckoutFragment
      }
    }
  }
`;
