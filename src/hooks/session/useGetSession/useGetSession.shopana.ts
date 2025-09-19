import { useLazyLoadQuery, usePreloadedQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { PreloadedQuery } from "react-relay/hooks";

export const useGetSessionQuery = graphql`
  query useGetSessionQuery {
    session {
    user {
      id
      iid
      email
    }
    accessToken
  }
  }
`;

// For regular requests (SPA)
const useGetSession = (fetchKey: number = 0) => {
  console.log("fetchKey Shopana", fetchKey);
  return useLazyLoadQuery(
    useGetSessionQuery,
    {},
    {
      fetchPolicy: "network-only",
      networkCacheConfig: {
        force: true,
      },
      fetchKey,
    }
  );
};

// For preloaded queries (SSR)
const useGetSessionPreloaded = (preloadedQuery: PreloadedQuery<typeof useGetSessionQuery>) => {
  // The caller must ensure preloadedQuery is valid to avoid crashing
  console.log("preloadedQuery Shopana", preloadedQuery);
  return usePreloadedQuery(useGetSessionQuery, preloadedQuery);
};

export default {
  useGetSession,
  useGetSessionPreloaded,
};
