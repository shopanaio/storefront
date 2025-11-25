import { graphql } from 'react-relay';

/**
 * GraphQL mutation for signing up with email and password
 */
export const signUpMutation = graphql`
  mutation signUpMutation($input: PasswordSignUpInput!) {
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
