'use client';

import { graphql, useMutation } from 'react-relay/hooks';

/**
 * GraphQL mutation for signing in with email and password
 */
const useSignInMutation = graphql`
  mutation useSignInMutation($input: PasswordSignInInput!) {
    passwordSignIn(input: $input) {
      session {
        accessToken
        user {
          id
          iid
          email
        }
      }
      errors {
        message
      }
    }
  }
`;

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
  return useMutation(useSignInMutation);
};

export default useSignIn;
