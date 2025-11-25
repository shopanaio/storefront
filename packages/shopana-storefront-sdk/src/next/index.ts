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
export { QueryProvider, useQuery, loadSerializableQuery } from './relay';
export type { SerializablePreloadedQuery } from './relay';
