import { ResetPasswordMutation } from "@src/relay/queries/ResetPassword.shopana";
import { useMutation } from "react-relay/hooks";

export function useResetPasswordMutation() {
  return useMutation(ResetPasswordMutation);
} 