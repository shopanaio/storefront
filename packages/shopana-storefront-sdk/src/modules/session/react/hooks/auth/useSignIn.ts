'use client';

import { useMutation } from 'react-relay/hooks';
import type { signInMutation as SignInMutationType } from '../../../core/graphql/mutations/__generated__/signInMutation.graphql';
import { signInMutation } from '../../../core/graphql/mutations/signInMutation';

/**
 * Hook to sign in a user with email and password
 *
 * @returns Relay mutation tuple [commit, isInFlight]
 *
 * @example
 * ```tsx
 * const [signIn, isLoading] = useSignIn();
 *
 * const handleSignIn = () => {
 *   signIn({
 *     variables: {
 *       input: { email: 'user@example.com', password: 'password123' }
 *     },
 *     onCompleted: (data) => {
 *       if (data.passwordSignIn.session) {
 *         // Sign in successful
 *       }
 *     }
 *   });
 * };
 * ```
 */
export const useSignIn = () => {
  return useMutation<SignInMutationType>(signInMutation);
};

export default useSignIn;
