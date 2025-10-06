import { useMutation } from 'react-relay';
import { toast } from '@src/components/UI/Toast/Toast';
import { GraphQLTaggedNode, MutationParameters } from 'relay-runtime';

/**
 * Options for promisified mutation
 */
export interface PromisifiedMutationOptions {
  /**
   * Show error toast on mutation failure
   * @default true
   */
  showErrorToast?: boolean;
  /**
   * Custom error message to display in toast
   */
  errorMessage?: string;
}

/**
 * Hook that wraps useMutation and returns a promisified method with optional error toast
 *
 * @template TMutation - The mutation type
 * @param mutation - The GraphQL mutation
 * @param options - Configuration options for error handling
 * @returns A promisified commit function and mutation state
 *
 * @example
 * ```ts
 * const { commit, isInFlight } = usePromisifiedMutation(
 *   myMutation,
 *   { showErrorToast: true, errorMessage: 'Failed to save' }
 * );
 *
 * try {
 *   await commit({ variables: { input } });
 * } catch (error) {
 *   // Error already shown in toast if showErrorToast is true
 * }
 * ```
 */
export function usePromisifiedMutation<TMutation extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  options: PromisifiedMutationOptions = {}
) {
  const { showErrorToast = true, errorMessage = 'Operation failed' } = options;

  const [commitMutation, isInFlight] = useMutation<TMutation>(mutation);

  const commit = (variables: TMutation['variables']): Promise<TMutation['response']> => {
    return new Promise((resolve, reject) => {
      commitMutation({
        variables,
        onCompleted: (response, errors) => {
          if (errors && errors.length) {
            if (showErrorToast) {
              toast.error(errorMessage);
            }
            return reject(errors);
          }
          resolve(response);
        },
        onError: (error) => {
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          reject(error);
        },
      });
    });
  };

  return { commit, isInFlight };
}
