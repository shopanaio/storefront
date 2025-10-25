import { graphql } from "relay-runtime";

const CollectionByHandleQuery = graphql`
  query CategoryQuery($handle: String!) {
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

export default CollectionByHandleQuery;
