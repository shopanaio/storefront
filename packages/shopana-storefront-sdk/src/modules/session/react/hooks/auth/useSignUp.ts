'use client';
import { useMutation } from '../../../../../graphql/apollo/hooks/useMutation';
import { signUpMutation } from '../../../core/graphql/mutations/signUpMutation';
/**
 * Hook to sign up a new user with email and password
 *
 * @returns Mutation tuple [commit, isInFlight]
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
  return useMutation(signUpMutation);
};
export default useSignUp;
