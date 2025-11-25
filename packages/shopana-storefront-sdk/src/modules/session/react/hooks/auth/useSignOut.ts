'use client';

import { useMutation } from 'react-relay/hooks';
import type { signOutMutation as SignOutMutationType } from '../../../core/graphql/mutations/__generated__/signOutMutation.graphql';
import { signOutMutation } from '../../../core/graphql/mutations/signOutMutation';

/**
 * Hook to sign out the current user
 *
 * @returns Relay mutation tuple [commit, isInFlight]
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
  return useMutation<SignOutMutationType>(signOutMutation);
};

export default useSignOut;
