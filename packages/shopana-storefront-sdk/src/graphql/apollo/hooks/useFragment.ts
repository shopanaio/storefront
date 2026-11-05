import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { useFragment as useApolloFragment } from '@apollo/client/react';

/**
 * On the server the parent's data already holds the fragment (nothing is masked), and a server
 * cache of whole responses has no entities to read it from.
 */
function useServerFragment<TData>(
  _fragment: unknown,
  from: TData | null | undefined
): TData | null {
  return from ?? null;
}

function useCacheFragment<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  fragment: DocumentNode | TypedDocumentNode<TData, TVariables>,
  from: TData | null | undefined
): TData | null {
  const fragmentName = fragment.definitions.find(
    (definition) => definition.kind === 'FragmentDefinition'
  )?.name.value;
  const result = useApolloFragment<TData, TVariables>({
    fragment,
    fragmentName,
    from: from ?? null,
  });

  if (process.env.NODE_ENV !== 'production' && !result.complete && from) {
    console.warn(
      `Apollo fragment ${fragmentName ?? '<anonymous>'} is incomplete`,
      result.missing
    );
  }

  return from ? (result.data as TData) : null;
}

export const useFragment =
  typeof window === 'undefined' ? useServerFragment : useCacheFragment;
