/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";
import loadSerializableQuery, {
  SerializablePreloadedQuery,
} from "@src/relay/loadSerializableQuery";
import HomePageQueryNode, {
  HomePageQuery,
} from "@src/hooks/home/HomePageQuery/__generated__/HomePageQuery.graphql";

/**
 * Server function for loading home page data
 */
const loadHomeServerQuery = async (): Promise<
  SerializablePreloadedQuery<any, any>
> => {
  const cookie = headers().get("cookie") ?? undefined;

  const preloadedQuery = await loadSerializableQuery<
    typeof HomePageQueryNode,
    HomePageQuery
  >(HomePageQueryNode.params, {}, cookie);

  return preloadedQuery;
};

export default loadHomeServerQuery;
