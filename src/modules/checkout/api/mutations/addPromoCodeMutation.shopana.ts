import { graphql } from "react-relay";

export const addPromoCodeMutation = graphql`
  mutation addPromoCodeMutation($input: CheckoutPromoCodeAddInput!) {
    checkoutMutation {
      checkoutPromoCodeAdd(input: $input) {
        ...useCart_CartFragment
      }
    }
  }
`;
