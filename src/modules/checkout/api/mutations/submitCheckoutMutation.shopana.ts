import { graphql } from "react-relay";

export const submitCheckoutMutation = graphql`
  mutation submitCheckoutMutation($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      orderId
      placementId
      checkoutId
      checkoutVersion
      resultRevision
      status
      paymentCollectionId
      paymentSessionId
      paymentOperationId
      customerAction {
        type
        url
      }
      paymentFailure {
        code
        message
        retryable
      }
      errors: userErrors {
        code
        field
        message
        retryable
      }
    }
  }
`;
