
import { useMutation } from "react-relay/hooks";
import { PasswordRecoveryPayloadMutation } from "@src/relay/queries/PasswordRecoveryPayloadMutation.shopana";

export function usePasswordRecoveryPayload() {
  return useMutation(PasswordRecoveryPayloadMutation);
}