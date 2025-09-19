"use client";

import React from "react";
import { PageLayout } from "@src/components/Layout/PageLayout";
import { Product } from "@src/components/Product/Product";
import { useRelayEnvironment } from "react-relay";
import useSerializablePreloadedQuery from "@src/relay/useSerializablePreloadedQuery";
import { useQuery } from "@src/providers/relay-query-provider";
import { ApiProduct } from "@codegen/schema-client";
import { Reviews$key } from "@src/relay/queries/__generated__/Reviews.graphql";
import { useRoutes } from "@src/hooks/useRoutes";
import usePreloadedProduct from "@src/hooks/product/usePreloadedProduct";

export const PageClient = () => {
  const environment = useRelayEnvironment();
  const preloadedQuery = useQuery();
  const routes = useRoutes();

  // Convert serializable query to Relay PreloadedQuery
  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery
  );

  // Use preloaded query without refetching
  const product = usePreloadedProduct(queryReference);

  if (!product) {
    return null;
  }

  return (
    <PageLayout
      breadcrumbs={{
        items: [
          ...[
            ...(product.category?.breadcrumbs || []),
            ...(product.category ? [product.category] : []),
          ].map((breadcrumb) => ({
            href: routes.category.path(breadcrumb.handle),
            title: breadcrumb.title,
          })),
          {
            title: product.title,
          },
        ],
      }}
    >
      <Product product={product as ApiProduct & Reviews$key} />
    </PageLayout>
  );
};
