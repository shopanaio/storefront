import { graphql, useMutation } from "react-relay/hooks";

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

const useSignUp = () => {
  return useMutation(useSignUpMutation);
};

export default useSignUp;