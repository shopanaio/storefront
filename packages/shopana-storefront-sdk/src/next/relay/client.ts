"use client";

// Client-only exports for Next.js Relay integration
// These are React hooks and client components

export { QueryProvider, useQuery } from "./QueryProvider";
export { default as useSerializablePreloadedQuery } from "./useSerializablePreloadedQuery";
export type { SerializablePreloadedQuery } from "./loadSerializableQuery";
