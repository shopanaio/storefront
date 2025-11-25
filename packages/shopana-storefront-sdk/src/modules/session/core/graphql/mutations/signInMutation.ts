import { graphql } from 'react-relay';

/**
 * GraphQL mutation for signing in with email and password
 */
export const signInMutation = graphql`
  mutation signInMutation($input: PasswordSignInInput!) {
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
