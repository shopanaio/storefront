// Re-export model namespace for convenient imports
// Usage: import { model } from '@shopana/storefront-sdk'
export { model } from './model/namespace';

// Re-export main AppProvider
export { App } from './App';
export { AppProvider } from './AppProvider';

// Public Apollo environment configuration.
export type { ApolloEnvironmentConfig } from './graphql/apollo/types';

// Re-export queries
export * from './queries';
