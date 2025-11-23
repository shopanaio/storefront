import { graphql, useMutation } from "react-relay/hooks";

const useForgotPasswordMutation = graphql`
  mutation useForgotPasswordMutation($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
            code
            field
            message
        }
        userErrors {
            field
            message
        }
    }
  }
`;

const useForgotPassword = () => {
  return useMutation(useForgotPasswordMutation);
};

export default useForgotPassword;