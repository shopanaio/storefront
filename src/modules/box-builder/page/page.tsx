import { headers } from "next/headers";
import React from "react";
import loadSerializableQuery from "@src/relay/loadSerializableQuery";
import CategoryQueryNode, {
  CategoryQuery,
} from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import { BoxBuilderClient } from "./client";
import { QueryProvider } from "@src/providers/relay-query-provider";
import { getDefaultBoxCategoryHandle } from "@src/modules/box-builder/config/categories";
import CartProvider from "@src/providers/cart";

export default async function BoxBuilderPage() {
  const cookie = headers().get("cookie") ?? undefined;

  // Preload only category for Step1: default box category from config
  const preloadedQuery = await loadSerializableQuery<
    typeof CategoryQueryNode,
    CategoryQuery
  >(
    CategoryQueryNode.params,
    { handle: getDefaultBoxCategoryHandle(), first: 12 },
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
    <CartProvider cookie="box-builder_cart_id">
      <QueryProvider preloadedQuery={preloadedQuery}>
        <BoxBuilderClient />
      </QueryProvider>
    </CartProvider>
  );
}
