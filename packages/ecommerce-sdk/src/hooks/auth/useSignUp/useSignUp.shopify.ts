import { graphql, useMutation } from "react-relay/hooks";

const useSignUpMutation = graphql`
  mutation useSignUpMutation($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          firstName
          lastName
          email
          phone
          acceptsMarketing
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;
const useSignUp = () => {
  return useMutation(useSignUpMutation);
};

export default useSignUp;