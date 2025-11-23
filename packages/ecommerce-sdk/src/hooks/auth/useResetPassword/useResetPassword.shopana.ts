
import { graphql, useMutation } from "react-relay/hooks";

const useResetPasswordMutation = graphql`
  mutation useResetPasswordMutation($input: ResetPasswordInput!) {
    resetPassword(input: $input){
      success
      clientMutationId
      errors{
        message
      }
    }
  }
`;

const useResetPassword = () => {
  return useMutation(useResetPasswordMutation);
};

export default useResetPassword;