// This file re-exports both server and client modules
// For better tree-shaking and to avoid mixing server/client code:
// - Use '@shopana/storefront-sdk/next/relay/server' for server-side code
// - Use '@shopana/storefront-sdk/next/relay/client' for client-side code

// Re-export everything for backwards compatibility
export type { SerializablePreloadedQuery } from "./loadSerializableQuery";
