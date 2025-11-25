import { cmsPick } from "@src/cms/pick";
import { useGetSessionDataShopana } from "./useGetSessionData.shopana";
import { useGetSessionDataShopify } from "./useGetSessionData.shopify";
import type { SerializablePreloadedQuery } from "@shopana/storefront-sdk/next/relay/loadSerializableQuery";
import { ConcreteRequest, OperationType } from "relay-runtime";

// Interface for session data
export interface SessionData {
  user: any;
  token: string | null;
  expiresAt?: string | null;
}

// Interface for input data
export interface UseGetSessionDataProps {
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    OperationType
  >;
}

export default cmsPick({
  shopana: useGetSessionDataShopana,
  shopify: useGetSessionDataShopify,
});
