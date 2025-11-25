import { cmsPick } from "@src/cms/pick";
import { useInitialSessionStateShopify } from "@src/hooks/session/useInitialSessionState/useInitialSessionState.shopify";
import { useInitialSessionStateShopana } from "@src/hooks/session/useInitialSessionState/useInitialSessionState.shopana";
import type { SerializablePreloadedQuery } from "@shopana/storefront-sdk/next/relay/server";
import { ConcreteRequest, OperationType } from "relay-runtime";
import type { model } from "@shopana/storefront-sdk";

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
}) as (props: UseInitialSessionStateProps) => model.Session | undefined;
