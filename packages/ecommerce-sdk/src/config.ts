/**
 * SDK Configuration
 *
 * This module provides configuration management for the ecommerce SDK.
 * It replaces environment variables with a configurable object pattern.
 */

export interface SDKConfig {
  /**
   * CMS provider to use (shopana or shopify)
   */
  cmsProvider: 'shopana' | 'shopify';

  /**
   * API endpoint for GraphQL requests
   */
  apiEndpoint: string;

  /**
   * Optional API key for authentication
   */
  apiKey?: string;

  /**
   * Default locale for the application
   */
  locale?: string;

  /**
   * Default currency code (e.g., 'USD', 'EUR')
   */
  currency?: string;
}

let config: SDKConfig | null = null;

/**
 * Initialize the SDK with configuration
 *
 * @param cfg - SDK configuration object
 *
 * @example
 * ```typescript
 * initSDK({
 *   cmsProvider: 'shopana',
 *   apiEndpoint: 'https://api.example.com/graphql',
 *   locale: 'en',
 *   currency: 'USD'
 * });
 * ```
 */
export const initSDK = (cfg: SDKConfig): void => {
  config = cfg;
};

/**
 * Get the current SDK configuration
 *
 * @throws Error if SDK is not initialized
 * @returns Current SDK configuration
 */
export const getSDKConfig = (): SDKConfig => {
  if (!config) {
    throw new Error(
      'SDK not initialized. Call initSDK() first with your configuration.'
    );
  }
  return config;
};

/**
 * Check if SDK is initialized
 *
 * @returns true if SDK is initialized, false otherwise
 */
export const isSDKInitialized = (): boolean => {
  return config !== null;
};

/**
 * Reset SDK configuration (mainly for testing)
 */
export const resetSDK = (): void => {
  config = null;
};
