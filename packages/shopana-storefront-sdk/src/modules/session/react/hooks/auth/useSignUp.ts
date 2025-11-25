'use client';

import { useMutation } from 'react-relay/hooks';
import type { signUpMutation as SignUpMutationType } from '../../../core/graphql/mutations/__generated__/signUpMutation.graphql';
import { signUpMutation } from '../../../core/graphql/mutations/signUpMutation';

/**
 * Hook to sign up a new user with email and password
 *
 * @returns Relay mutation tuple [commit, isInFlight]
 *
 * @example
 * ```tsx
 * const [signUp, isLoading] = useSignUp();
 *
 * const handleSignUp = () => {
 *   signUp({
 *     variables: {
 *       input: {
 *         email: 'user@example.com',
 *         password: 'password123',
 *         firstName: 'John',
 *         lastName: 'Doe'
 *       }
 *     },
 *     onCompleted: (data) => {
 *       if (data.passwordSignUp.session) {
 *         // Sign up successful
 *       }
 *     }
 *   });
 * };
 * ```
 */
export const useSignUp = () => {
  return useMutation<SignUpMutationType>(signUpMutation);
};

export default useSignUp;
