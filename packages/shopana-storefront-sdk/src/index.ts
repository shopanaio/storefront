// Main entry point for @shopana/storefront-sdk
// Re-exports all public APIs

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
} from './core/index';

export type {
  Template,
  LayoutProps,
  SectionProps,
  BlockProps,
  PageType,
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
export { parseRoute } from './utils/routeParser';
export { logError, configureLogger } from './utils/logger';
export type { LogLevel, LogContext, LogErrorOptions } from './utils/logger';
