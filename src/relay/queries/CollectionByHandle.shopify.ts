import { graphql } from "relay-runtime";

export const CollectionByHandleQuery = graphql`
  query CollectionByHandleQuery($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      ...Listing
        @arguments(first: 20, after: null)
    }
  }
`;