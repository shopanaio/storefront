/* eslint-disable @typescript-eslint/no-explicit-any */
import loadSerializableQuery from "@shopana/storefront-sdk/next/relay/loadSerializableQuery";
import type { SerializablePreloadedQuery } from "@shopana/storefront-sdk/next/relay/loadSerializableQuery";
import { environmentConfig } from "@src/config/environment.config";
import HomePageQueryNode, {
  HomePageQuery,
} from "@src/hooks/home/HomePageQuery/__generated__/HomePageQuery.graphql";

/**
 * Server function for loading home page data
 */
const loadHomeServerQuery = async (): Promise<
  SerializablePreloadedQuery<any, any>
> => {
  const preloadedQuery = await loadSerializableQuery<
    typeof HomePageQueryNode,
    HomePageQuery
  >(environmentConfig, HomePageQueryNode.params, {});

  return preloadedQuery;
};

export default loadHomeServerQuery;
