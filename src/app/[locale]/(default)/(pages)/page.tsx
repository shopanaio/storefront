import React from "react";
import { QueryProvider } from "@src/providers/relay-query-provider";
import loadHomeServerQuery from "@src/hooks/home/loadHomeServerQuery";
import { HomeClient } from "./client";

export default async function HomePage() {
  const preloadedQuery = await loadHomeServerQuery();
  return (
    <QueryProvider preloadedQuery={preloadedQuery}>
      <HomeClient />
    </QueryProvider>
  );
}
