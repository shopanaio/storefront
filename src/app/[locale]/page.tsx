import React from "react";
import { HomeClient } from "@src/app/[locale]/client";
import { QueryProvider } from "@src/providers/relay-query-provider";
import loadHomeServerQuery from "@src/hooks/home/loadHomeServerQuery";

export default async function HomePage() {
  const preloadedQuery = await loadHomeServerQuery();
  return (
    <QueryProvider preloadedQuery={preloadedQuery}>
      <HomeClient />
    </QueryProvider>
  );
}
