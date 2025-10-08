import { graphql } from "react-relay";

export const submitCheckoutMutation = graphql`
  mutation submitCheckoutMutation($input: CreateOrderInput!) {
    orderMutation {
      orderCreate(input: $input) {
        id
      }
    }
  }
`;
