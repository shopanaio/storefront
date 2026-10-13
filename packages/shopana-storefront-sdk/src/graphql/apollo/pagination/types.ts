import type { OperationVariables, TypedDocumentNode } from '@apollo/client';

export interface CursorPageInfo {
  readonly hasNextPage: boolean;
  readonly endCursor?: string | null;
}

export interface CursorConnection<TEdge = unknown> {
  readonly edges?: readonly TEdge[] | null;
  readonly pageInfo: CursorPageInfo;
}

export interface PaginationContext<TVariables extends OperationVariables> {
  variables: TVariables;
  count: number;
  endCursor: string | null;
}

export interface PaginationQueryDescriptor<
  TData,
  TVariables extends OperationVariables,
  TConnection extends CursorConnection,
> {
  query: TypedDocumentNode<TData, TVariables>;
  getConnection(data: TData): TConnection | null | undefined;
  getNextVariables(context: PaginationContext<TVariables>): TVariables;
}
