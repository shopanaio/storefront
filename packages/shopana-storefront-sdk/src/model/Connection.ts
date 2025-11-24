/**
 * PageInfo - pagination metadata for cursor-based pagination
 * Following Relay Cursor Connections Specification
 */
export interface PageInfo {
  /** Indicates if there are more items when paginating forward */
  hasNextPage: boolean;
  /** Indicates if there are more items when paginating backward */
  hasPreviousPage: boolean;
  /** Cursor to the first item in the result set */
  startCursor?: string;
  /** Cursor to the last item in the result set */
  endCursor?: string;
}

/**
 * Edge - single edge in a connection
 * Generic type for any node type
 */
export interface Edge<T> {
  /** The node (entity) */
  node: T;
  /** Cursor for pagination */
  cursor: string;
}

/**
 * Connection - paginated collection following Relay specification
 * Generic type for any node type
 */
export interface Connection<T> {
  /** Array of edges */
  edges: Array<Edge<T>>;
  /** Pagination information */
  pageInfo: PageInfo;
  /** Total count of items */
  totalCount: number;
}
