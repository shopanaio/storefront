import { graphql } from "relay-runtime";

export const ResetPasswordMutation = graphql`
  mutation ResetPasswordMutation($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      errors {
        message
      }
    }
  }
`;