import { useLazyLoadQuery } from 'react-relay';
import CollectionByHandleQuery from '@src/queries/CategoryQuery';
import { CategoryQuery as CategoryQueryType } from '@src/queries/CategoryQuery/__generated__/CategoryQuery.graphql';

const useCategoryClientQuery = (handle: string) => {
  const data = useLazyLoadQuery<CategoryQueryType>(
    CollectionByHandleQuery,
    { handle },
    { fetchPolicy: 'store-or-network' }
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
