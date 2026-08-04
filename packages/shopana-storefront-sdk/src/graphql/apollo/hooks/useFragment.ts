import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { useFragment as useApolloFragment } from '@apollo/client/react';

export function useFragment<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  fragment: DocumentNode | TypedDocumentNode<TData, TVariables>,
  from: TData | null | undefined
): TData | null {
  const result = useApolloFragment<TData, TVariables>({
    fragment,
    from: from ?? null,
  });

  if (process.env.NODE_ENV !== 'production' && !result.complete && from) {
    const fragmentName = fragment.definitions.find(
      (definition) => definition.kind === 'FragmentDefinition'
    )?.name.value;
    console.warn(
      `Apollo fragment ${fragmentName ?? '<anonymous>'} is incomplete`,
      result.missing
    );
  }

  return from ? (result.data as TData) : null;
}
