import { graphql } from 'react-relay';

/**
 * GraphQL mutation for requesting password recovery
 */
export const forgotPasswordMutation = graphql`
  mutation forgotPasswordMutation($input: PasswordRecoveryInput!) {
    requestPasswordRecovery(input: $input) {
      success
      clientMutationId
      errors {
        message
      }
    }
  }
`;
