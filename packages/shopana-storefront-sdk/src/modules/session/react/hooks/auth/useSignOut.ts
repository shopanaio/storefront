'use client';
import { useMutation } from '../../../../../graphql/apollo/hooks/useMutation';
import { signOutMutation } from '../../../core/graphql/mutations/signOutMutation';
/**
 * Hook to sign out the current user
 *
 * @returns Mutation tuple [commit, isInFlight]
 *
 * @example
 * ```tsx
 * const [signOut, isLoading] = useSignOut();
 *
 * const handleSignOut = () => {
 *   signOut({
 *     variables: {},
 *     onCompleted: () => {
 *       // Sign out successful
 *       // Clear session store, redirect to home, etc.
 *     }
 *   });
 * };
 * ```
 */
export const useSignOut = () => {
  return useMutation(signOutMutation);
};
export default useSignOut;
