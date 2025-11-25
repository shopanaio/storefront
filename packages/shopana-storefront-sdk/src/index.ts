// Main entry point for @shopana/storefront-sdk
// Re-exports all public APIs

// App component - client-only wrapper with all providers
export { App } from './App';
export type { AppProps } from './App';

// AppProvider - server component with SSR cart loading
export { AppProvider } from './AppProvider';
export type { AppProviderProps } from './AppProvider';

// Core exports (Builder, types, components)
export {
  Builder,
  Section,
  Block,
  TemplateDataProvider,
  useTemplateData,
  ErrorBoundary,
  SectionErrorBoundary,
  BlockErrorBoundary,
  parseRoute,
} from './core/index';

export type {
  Template,
  LayoutProps,
  SectionProps,
  BlockProps,
  PageType,
  ParsedRoute,
} from './core/index';

// Shop context exports
export {
  ShopProvider,
  ShopContext,
  useShop,
  mockShopConfig,
  MOCK_LOCALES,
  MOCK_CURRENCIES,
} from './shop/index';

export type {
  ShopConfig,
  Locale,
  Currency,
  MoneyFormat,
  ShopFeatures,
  ShopSEO,
  ShopSocial,
  ShopAddress,
  WeightUnit,
  MeasurementUnit,
  ShopProviderProps,
} from './shop/index';

// Utilities
export { logError, configureLogger } from './utils/logger';
export type { LogLevel, LogContext, LogErrorOptions } from './utils/logger';

// Relay environment
export type { RelayEnvironmentConfig } from './graphql/relay/index';

// Model namespace
export { model } from './model/index';
