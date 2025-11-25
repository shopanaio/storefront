import type { RelayEnvironmentConfig } from '../graphql/relay/types';

let cachedEnvironmentConfig: RelayEnvironmentConfig | null = null;

export function setEnvironmentConfig(config: RelayEnvironmentConfig) {
  cachedEnvironmentConfig = config;
}

export function getEnvironmentConfig(): RelayEnvironmentConfig {
  if (!cachedEnvironmentConfig) {
    throw new Error(
      'Environment config is not set. Ensure AppProvider is mounted in your root layout.',
    );
  }

  return cachedEnvironmentConfig;
}
