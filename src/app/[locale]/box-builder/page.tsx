import { headers } from "next/headers";
import React from "react";
import loadSerializableQuery from "@src/relay/loadSerializableQuery";
import CategoryQueryNode, {
  CategoryQuery,
} from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import { BoxBuilderClient } from "@src/app/[locale]/box-builder/client";
import { QueryProvider } from "@src/providers/relay-query-provider";
import { parseUserAgent } from "@src/utils/parseUserAgent";

export default async function BoxBuilderPage() {
  const cookie = headers().get("cookie") ?? undefined;
  const userAgent = headers().get("user-agent") ?? "";

  const { isIOS } = parseUserAgent(userAgent);

  // Preload only category for Step1: boxes
  const preloadedQuery = await loadSerializableQuery<
    typeof CategoryQueryNode,
    CategoryQuery
  >(
    CategoryQueryNode.params,
    { handle: "boxes", first: 12 },
    cookie
  );

  let hasData = false;
  if (Array.isArray(preloadedQuery.response)) {
    const single = preloadedQuery.response.find(
      (r): r is { data: { electronics?: unknown } } => !!r && "data" in r
    );
    hasData = !!single?.data;
  } else if ("data" in preloadedQuery.response) {
    hasData = !!preloadedQuery.response.data;
  }

  if (!hasData) {
    return <div>Data not found</div>;
  }

  return (
    <QueryProvider preloadedQuery={preloadedQuery}>
      <BoxBuilderClient isIOS={isIOS} />
    </QueryProvider>
  );
}
