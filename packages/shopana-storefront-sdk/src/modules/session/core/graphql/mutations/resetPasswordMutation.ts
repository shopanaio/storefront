import { graphql } from 'react-relay';

/**
 * GraphQL mutation for resetting password with token
 */
export const resetPasswordMutation = graphql`
  mutation resetPasswordMutation($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      clientMutationId
      errors {
        message
      }
    }
  }
`;
