import { graphql, useMutation } from "react-relay/hooks";

const useSignOutMutation = graphql`
mutation useSignOutMutation($customerAccessToken: String!) {
  customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
    deletedAccessToken
    deletedCustomerAccessTokenId
    userErrors {
      field
      message
    }
  }
}
`;

const useSignOut = () => {
  return useMutation(useSignOutMutation);
};

export default useSignOut;