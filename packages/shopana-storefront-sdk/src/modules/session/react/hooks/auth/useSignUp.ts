'use client';

import { graphql, useMutation } from 'react-relay/hooks';

/**
 * GraphQL mutation for signing up with email and password
 */
const useSignUpMutation = graphql`
  mutation useSignUpMutation($input: PasswordSignUpInput!) {
    passwordSignUp(input: $input) {
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
  return useMutation(useSignUpMutation);
};

export default useSignUp;
