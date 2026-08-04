'use client';
import { useMutation } from '../../../../../graphql/apollo/hooks/useMutation';
import { signInMutation } from '../../../core/graphql/mutations/signInMutation';
/**
 * Hook to sign in a user with email and password
 *
 * @returns Mutation tuple [commit, isInFlight]
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
  return useMutation(signInMutation);
};
export default useSignIn;
