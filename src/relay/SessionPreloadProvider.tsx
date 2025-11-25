/* import React, { useState, useCallback, useEffect } from "react";
import useGetSession from "@src/hooks/session";
import { SerializablePreloadedQuery } from "@src/relay/useSerializablePreloadedQuery";
import { useGetSessionQuery as useGetSessionQueryType } from "@src/hooks/session/__generated__/useGetSessionQuery.graphql";
import { ConcreteRequest } from "relay-runtime";
import { useRelayEnvironment } from "react-relay";
import useSerializablePreloadedQuery from "@src/relay/useSerializablePreloadedQuery";
import loadSerializableQuery from "@src/relay/loadSerializableQuery";
import useGetSessionQuery from "@src/hooks/session/__generated__/useGetSessionQuery.graphql";
import { useSession } from "@src/store/sessionStore";

interface SessionPreloadProviderProps {
  children: React.ReactNode;
  preloadedSessionQuery?: SerializablePreloadedQuery<
    ConcreteRequest,
    useGetSessionQueryType
  >;
}

export function SessionPreloadProvider({
  children,
  preloadedSessionQuery: initialPreloadedQuery,
}: SessionPreloadProviderProps) {
  const [preloadedSessionQuery, setPreloadedSessionQuery] = useState<
    | SerializablePreloadedQuery<ConcreteRequest, useGetSessionQueryType>
    | undefined
  >(initialPreloadedQuery);

  const environment = useRelayEnvironment();
  const query = useSerializablePreloadedQuery(
    environment,
    preloadedSessionQuery!
  );

  console.log("environment SessionPreloadProvider", environment);

  console.log(
    "preloadedSessionQuery SessionPreloadProvider",
    preloadedSessionQuery
  );
  console.log("query SessionPreloadProvider", query);
  console.log(
    "useGetSession.useGetSessionPreloaded",
    useGetSession.useGetSessionPreloaded
  );

  const sessionData = useGetSession.useGetSessionPreloaded(query);

  console.log("sessionData SessionPreloadProvider", sessionData);

  const setSession = useSession((state) => state.setSession);
  const setRefreshSession = useSession((state) => state.setRefreshSession);

  useEffect(() => {
    console.log("sessionData useEffect", sessionData);
    if (sessionData?.session) {
      setSession(sessionData.session);
    } else {
      setSession(null);
    }
  }, [sessionData, setSession]);

  const refreshSession = useCallback(() => {
    loadSerializableQuery(useGetSessionQuery.params, {}).then((newQuery) => {
      setPreloadedSessionQuery(
        newQuery as SerializablePreloadedQuery<
          ConcreteRequest,
          useGetSessionQueryType
        >
      );
    });
  }, [environment]);

  useEffect(() => {
    setRefreshSession(() => refreshSession);
  }, [refreshSession, setRefreshSession]);

  useEffect(() => {
    if (!preloadedSessionQuery) {
      loadSerializableQuery(useGetSessionQuery.params, {}).then((newQuery) => {
        setPreloadedSessionQuery(
          newQuery as SerializablePreloadedQuery<
            ConcreteRequest,
            useGetSessionQueryType
          >
        );
      });
    }
  }, [preloadedSessionQuery, environment]);

  if (!preloadedSessionQuery) {
    return null;
  }

  return <>{children}</>;
}
 */
