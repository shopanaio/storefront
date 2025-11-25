'use client';

import { graphql, useMutation } from 'react-relay/hooks';

/**
 * GraphQL mutation for signing out
 */
const useSignOutMutation = graphql`
  mutation useSignOutMutation {
    signOut
  }
`;

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
  return useMutation(useSignOutMutation);
};

export default useSignOut;
