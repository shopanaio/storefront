import { useLazyLoadQuery } from "react-relay";
import { CollectionByHandleQuery } from "@src/relay/queries/CollectionByHandle.shopify";
import { CollectionByHandleQuery as CollectionByHandleQueryType } from "@src/relay/queries/__generated__/CollectionByHandleQuery.graphql";

const useCategoryClientQuery = (handle: string, first: number = 20) => {
  const data = useLazyLoadQuery<CollectionByHandleQueryType>(
    CollectionByHandleQuery,
    { handle },
    { fetchPolicy: "store-or-network" }
  );

  const collection = data?.collection;
  if (!collection) return null;

  // Return data in simple format
  return {
    ...collection,
    // Add basic listing field for compatibility
    listing: {
      totalCount: 0, // Set to 0 for now
      filters: [], // Empty array for now
      pageInfo: collection.listing?.pageInfo || {},
      edges: collection.listing?.edges || [],
    },
  };
};

export default useCategoryClientQuery;
