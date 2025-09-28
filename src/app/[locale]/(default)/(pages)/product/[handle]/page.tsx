/**
 * SSR implementation with Relay + Next.js for any page
 * ==========================================================
 *
 * This pattern solves the double data fetching problem (server + client)
 * and ensures proper data hydration from server to client.
 *
 *
 * 1. Create GraphQL query with fragments:
 * ```typescript
 * // src/relay/queries/YourPageQuery.ts
 * export const YourPageQuery = graphql`
 *   query YourPageQuery($id: ID!, $param: String) {
 *     yourData(id: $id) {
 *       id
 *       title
 *       ...YourFragment @arguments(param: $param)
 *     }
 *   }
 * `;
 * ```
 *
 * 2. Create provider for data transfer:
 * ```typescript
 * // src/providers/your-page-query-provider.tsx
 * "use client";
 *
 * import React, { createContext, useContext } from "react";
 * import { SerializablePreloadedQuery } from "@src/relay/loadSerializableQuery";
 * import { YourPageQuery as YourPageQueryType } from "@src/relay/queries/__generated__/YourPageQuery.graphql";
 * import { ConcreteRequest } from "relay-runtime";
 *
 * type ContextType = {
 *   preloadedQuery: SerializablePreloadedQuery<ConcreteRequest, YourPageQueryType>;
 * } | null;
 *
 * const YourPageQueryContext = createContext<ContextType>(null);
 *
 * export function YourPageQueryProvider({ children, preloadedQuery }) {
 *   return (
 *     <YourPageQueryContext.Provider value={{ preloadedQuery }}>
 *       {children}
 *     </YourPageQueryContext.Provider>
 *   );
 * }
 *
 * export function useYourPageQuery() {
 *   const context = useContext(YourPageQueryContext);
 *   if (!context) throw new Error("useYourPageQuery must be used within provider");
 *   return context.preloadedQuery;
 * }
 * ```
 *
 * 3. Server component (RSC) - loads data:
 * ```typescript
 * // src/app/[locale]/your-page/[id]/page.tsx
 * export default async function YourPage({ params }) {
 *   const cookie = headers().get("cookie") ?? undefined;
 *
 *   // Load data on server with parameters for fragments
 *   const preloadedQuery = await loadSerializableQuery<
 *     typeof YourPageQueryNode,
 *     YourPageQuery
 *   >(
 *     YourPageQueryNode.params,
 *     {
 *       id: params.id,
 *       param: "default_value", // parameters for fragments
 *     },
 *     cookie
 *   );
 *
 *   // Check data availability
 *   let hasData = false;
 *   if (Array.isArray(preloadedQuery.response)) {
 *     const single = preloadedQuery.response.find(r => r && "data" in r);
 *     hasData = !!single?.data?.yourData;
 *   } else if ("data" in preloadedQuery.response) {
 *     hasData = !!preloadedQuery.response.data?.yourData;
 *   }
 *
 *   if (!hasData) notFound();
 *
 *   return (
 *     <YourPageQueryProvider preloadedQuery={preloadedQuery}>
 *       <YourPageClient />
 *     </YourPageQueryProvider>
 *   );
 * }
 * ```
 *
 * 4. Client component - uses preloaded data:
 * ```typescript
 * // src/app/[locale]/your-page/[id]/client.tsx
 * "use client";
 *
 * export const YourPageClient = () => {
 *   const environment = useRelayEnvironment();
 *   const preloadedQuery = useYourPageQuery();
 *
 *   // Convert to Relay PreloadedQuery
 *   const queryReference = useSerializablePreloadedQuery(
 *     environment,
 *     preloadedQuery
 *   );
 *
 *   // Use preloaded data WITHOUT refetching
 *   const data = usePreloadedQuery<YourPageQuery>(
 *     YourPageQueryNode,
 *     queryReference
 *   );
 *
 *   return <YourComponent data={data.yourData} />;
 * };
 * ```
 *
 * 5. Component with fragments:
 * ```typescript
 * interface Props {
 *   data: ApiYourData & YourFragment$key; // Combine types
 * }
 *
 * export const YourComponent = ({ data }: Props) => {
 *   // Use fragment for pagination
 *   const { data: fragmentData, loadNext } = usePaginationFragment(
 *     YourFragment,
 *     data // pass as fragment reference
 *   );
 * };
 * ```
 *
 * IMPORTANT POINTS:
 * - All parameters for fragments are set on the server
 * - Client does NOT make repeated requests on first load
 * - Use usePreloadedQuery instead of useLazyLoadQuery
 * - Types are combined with & for fragments
 * - Provider is needed for data transfer without prop drilling
 *
 * VERIFICATION:
 * DevTools Network should not have GraphQL requests on first page load
 * - all data should come from server through hydration.
 */

import { headers } from "next/headers";
import React from "react";
import loadSerializableQuery from "@src/relay/loadSerializableQuery";
import ProductQueryNode, {
  ProductQuery as ProductQueryType,
} from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";
import { notFound } from "next/navigation";
import { QueryProvider } from "@src/providers/relay-query-provider";
import { ProductReviewSort } from "@codegen/schema-client";
import { PageClient } from "./client";

interface ProductPageProps {
  params: {
    locale: string;
    handle: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = params;
  const cookie = headers().get("cookie") ?? undefined;

  // Load data on server with default parameters for Reviews fragment
  const preloadedQuery = await loadSerializableQuery<
    typeof ProductQueryNode,
    ProductQueryType
  >(
    ProductQueryNode.params,
    {
      handle,
      first: 3,
      sort: ProductReviewSort.HelpfulYesDesc,
    },
    cookie
  );

  // Check data availability
  let hasProduct = false;
  if (Array.isArray(preloadedQuery.response)) {
    const single = preloadedQuery.response.find(
      (r): r is { data: { product?: unknown } } => !!r && "data" in r
    );
    hasProduct = !!single?.data?.product;
  } else if ("data" in preloadedQuery.response) {
    hasProduct = !!preloadedQuery.response.data?.product;
  }

  if (!hasProduct) {
    notFound();
  }

  return (
    <QueryProvider preloadedQuery={preloadedQuery}>
      <PageClient />
    </QueryProvider>
  );
}
