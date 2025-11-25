/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  loadSerializableQuery,
  SerializablePreloadedQuery,
} from "@shopana/storefront-sdk/next/relay/server";
import { networkFetch } from "@src/relay/networkFetch";
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
  >(networkFetch, HomePageQueryNode.params, {});

  return preloadedQuery;
};

export default loadHomeServerQuery;
