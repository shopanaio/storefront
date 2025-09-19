
import { graphql, useMutation } from "react-relay/hooks";

const useForgotPasswordMutation = graphql`
  mutation useForgotPasswordMutation($input: PasswordRecoveryInput!) {
    requestPasswordRecovery(input: $input) {
      success
      clientMutationId
      errors{
        message
      }
    }
  }
`;

const useForgotPassword = () => {
  return useMutation(useForgotPasswordMutation);
};

export default useForgotPassword;