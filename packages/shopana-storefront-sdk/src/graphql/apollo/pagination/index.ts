// Server-safe pagination entry: no React imports, so descriptors can be defined in Server Components.
export { definePaginationQuery } from './definePaginationQuery';
export { cursorConnectionPolicy } from './cursorPagination';
export { stableSerializeOperationVariables } from './stableSerializeOperationVariables';
export type {
  CursorConnection,
  CursorPageInfo,
  PaginationQueryDescriptor,
} from './types';
