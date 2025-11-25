import { headers } from "next/headers";
import accessTokenUtils from "@src/utils/accessToken";
import {
  loadSerializableQuery,
  SerializablePreloadedQuery,
} from "@shopana/storefront-sdk/next/relay/server";
import { environmentConfig } from "@src/config/environment.config";
import useGetSessionQuery from "@src/hooks/session/useGetSession/__generated__/useGetSessionQuery.graphql";
import { QueryProvider } from "@src/providers/relay-query-provider";
import { ConcreteRequest, OperationType } from "relay-runtime";

export async function SessionServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await headers()).get("cookie") ?? undefined;
  const customerAccessToken = accessTokenUtils.getAccessTokenFromCookie(cookie);

  let preloadedSessionQuery: SerializablePreloadedQuery<
    ConcreteRequest,
    OperationType
  >;

  if (customerAccessToken) {
    preloadedSessionQuery = await loadSerializableQuery(
      environmentConfig,
      useGetSessionQuery.params,
      { customerAccessToken }
    );
  } else {
    preloadedSessionQuery = {
      params: useGetSessionQuery.params,
      variables: {} as any,
      response: { data: {} } as any,
    };
  }

  return (
    <QueryProvider preloadedQuery={preloadedSessionQuery}>
      {children}
    </QueryProvider>
  );
}
