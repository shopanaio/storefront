/**
 * Shop configuration module
 *
 * This module provides global shop configuration, similar to Shopify's shop object.
 * It includes locale, currency, features, and utility functions for common operations.
 *
 * @module core/shop
 *
 * @example
 * ```tsx
 * // Setup in root layout
 * import { ShopProvider, mockShopConfig } from '@shopana/next-ecommerce-core/shop';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ShopProvider config={mockShopConfig}>
 *       {children}
 *     </ShopProvider>
 *   );
 * }
 *
 * // Use in any component
 * import { useShop } from '@shopana/next-ecommerce-core/shop';
 *
 * function ProductPrice({ amount }) {
 *   const shop = useShop();
 *   return <span>{shop.formatMoney(amount)}</span>;
 * }
 * ```
 */

// Context and Provider
export { ShopProvider, ShopContext } from './ShopContext';
export type { ShopProviderProps } from './ShopContext';

// Hooks
export { useShop, useShopOptional } from './useShop';
export type { ShopUtilities, UseShopReturn } from './useShop';

// Types
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
} from './types';

// Mock data (for development/testing)
export { mockShopConfig, MOCK_LOCALES, MOCK_CURRENCIES } from './mockShopConfig';
