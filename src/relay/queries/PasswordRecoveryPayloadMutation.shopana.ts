import { graphql } from "relay-runtime";

export const PasswordRecoveryPayloadMutation = graphql`
  mutation PasswordRecoveryPayloadMutation($input: PasswordRecoveryInput!) {
    requestPasswordRecovery(input: $input) {
      errors {
        message
      }
    }
  }
`;
