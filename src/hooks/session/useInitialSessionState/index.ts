import { cmsPick } from "@src/cms/pick";
import { useInitialSessionStateShopify } from "@src/hooks/session/useInitialSessionState/useInitialSessionState.shopify";
import { useInitialSessionStateShopana } from "@src/hooks/session/useInitialSessionState/useInitialSessionState.shopana";
import { SerializablePreloadedQuery } from "@src/relay/loadSerializableQuery";
import { ConcreteRequest, OperationType } from "relay-runtime";
import { Session } from "@src/entity/Session";

// Interface for input props
export interface UseInitialSessionStateProps {
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    OperationType
  >;
}

export default cmsPick({
  shopana: useInitialSessionStateShopana,
  shopify: useInitialSessionStateShopify,
}) as (props: UseInitialSessionStateProps) => Session | undefined;
