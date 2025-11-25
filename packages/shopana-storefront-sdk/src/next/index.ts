// Next.js specific exports
// This module provides Next.js integration for @shopana/storefront-sdk
// Import as: @shopana/storefront-sdk/next

// Note: Page component is available via @shopana/storefront-sdk/next/page
// and should be re-exported in your Next.js app:
// export { Page as default, generateMetadata } from '@shopana/storefront-sdk/next/page';

export const NEXT_JS_INTEGRATION_VERSION = '1.0.0';

// Re-export utilities that might be useful for Next.js projects
export { logError, configureLogger } from '../utils/logger';
export type { LogLevel, LogContext, LogErrorOptions } from '../utils/logger';

// Re-export Relay integration for Next.js
// Note: For better tree-shaking, import directly from:
// - '@shopana/storefront-sdk/next/relay/server' for server components
// - '@shopana/storefront-sdk/next/relay/client' for client components
export { loadSerializableQuery } from './relay/server';
export { QueryProvider, useQuery, useSerializablePreloadedQuery } from './relay/client';
export type { SerializablePreloadedQuery } from './relay/server';
