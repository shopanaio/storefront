import type { ApolloEnvironmentConfig } from '../graphql/apollo/types';

let cachedEnvironmentConfig: ApolloEnvironmentConfig | null = null;

export function setEnvironmentConfig(config: ApolloEnvironmentConfig) {
  cachedEnvironmentConfig = config;
}

export function getEnvironmentConfig(): ApolloEnvironmentConfig {
  if (!cachedEnvironmentConfig) {
    throw new Error(
      'Environment config is not set. Ensure AppProvider is mounted in your root layout.'
    );
  }

  return cachedEnvironmentConfig;
}
