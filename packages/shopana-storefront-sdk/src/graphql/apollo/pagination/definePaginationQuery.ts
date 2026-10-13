import type { OperationVariables } from '@apollo/client';
import type { CursorConnection, PaginationQueryDescriptor } from './types';

export function definePaginationQuery<
  TData,
  TVariables extends OperationVariables,
  TConnection extends CursorConnection,
>(
  descriptor: PaginationQueryDescriptor<TData, TVariables, TConnection>
): PaginationQueryDescriptor<TData, TVariables, TConnection> {
  return descriptor;
}
