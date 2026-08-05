export { createApolloClient } from './Environment';
export { createApolloCache, mergeApolloCacheStates } from './cache';
export {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from './loadSerializableQuery';
export type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from './types';
export { useFragment } from './hooks/useFragment';
export { useLazyLoadQuery } from './hooks/useLazyLoadQuery';
export { useMutation } from './hooks/useMutation';
export { usePaginationQuery } from './hooks/usePaginationQuery';
export { usePreloadedQuery } from './hooks/usePreloadedQuery';
export { fetchQuery } from './hooks/fetchQuery';
export { definePaginationQuery } from './pagination/definePaginationQuery';
export { cursorConnectionPolicy } from './pagination/cursorPagination';
export { stableSerializeOperationVariables } from './pagination/stableSerializeOperationVariables';
export type {
  CursorConnection,
  CursorPageInfo,
  PaginationQueryDescriptor,
} from './pagination/types';
