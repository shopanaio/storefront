// Server-only exports for Next.js Relay integration
// These use Next.js server APIs like headers()

export { default as loadSerializableQuery } from "./loadSerializableQuery";
export type { SerializablePreloadedQuery } from "./loadSerializableQuery";
export type { RelayEnvironmentConfig } from "../../graphql/relay";
