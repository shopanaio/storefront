import { graphql } from "react-relay";

export const clearCartLinesMutation = graphql`
  mutation clearCartLinesMutation($input: ClearCartLinesInput!) {
    clearCartLines(input: $input) {
      cart {
        ...useCart_CartFragment
      }
      errors {
        message
      }
    }
  }
`;
