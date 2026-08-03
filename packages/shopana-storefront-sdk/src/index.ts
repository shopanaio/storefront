// Re-export model namespace for convenient imports
// Usage: import { model } from '@shopana/storefront-sdk'
export { model } from './model/namespace';

// Re-export main AppProvider
export { App } from './App';
export { AppProvider } from './AppProvider';

// Apollo and Relay intentionally coexist while new UI is migrated by domain.
export type { ApolloEnvironmentConfig } from './graphql/apollo/types';

// Re-export queries
export * from './queries';
