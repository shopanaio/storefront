'use client';

import { useContext, useMemo } from 'react';
import { ShopContext } from './ShopContext';
import type { ShopConfig, Currency, Locale } from './types';

/**
 * Extended shop utilities interface
 * Provides helper methods for common shop operations
 */
export interface ShopUtilities {
  /**
   * Formats a monetary amount according to the shop's currency settings
   *
   * @param amount - The amount to format
   * @param currency - Optional currency override (uses shop's default if not provided)
   * @returns Formatted money string (e.g., "$100.00" or "100,00₴")
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * const price = shop.formatMoney(1234.56); // "$1,234.56"
   * const priceInEuro = shop.formatMoney(1234.56, euroCurrency); // "1.234,56€"
   * ```
   */
  formatMoney: (amount: number, currency?: Currency) => string;

  /**
   * Formats a date according to the shop's date format settings
   *
   * @param date - Date to format (Date object or ISO string)
   * @returns Formatted date string according to shop.dateFormat
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * const formatted = shop.formatDate(new Date()); // "22/11/2025" or "11/22/2025"
   * const fromString = shop.formatDate("2025-11-22"); // "22/11/2025"
   * ```
   */
  formatDate: (date: Date | string) => string;

  /**
   * Formats a weight value with the appropriate unit
   *
   * @param weight - Weight value to format
   * @returns Formatted weight string with unit (e.g., "5 kg" or "10 lb")
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * const weight = shop.formatWeight(5.5); // "5.5 kg"
   * ```
   */
  formatWeight: (weight: number) => string;

  /**
   * Checks if a specific feature is enabled in the shop
   *
   * @param feature - Feature name to check
   * @returns true if the feature is enabled, false otherwise
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * if (shop.hasFeature('cart')) {
   *   // Show add to cart button
   * }
   * ```
   */
  hasFeature: (feature: keyof ShopConfig['features']) => boolean;

  /**
   * Translation function (placeholder for i18n integration)
   *
   * @param key - Translation key
   * @param params - Optional parameters for interpolation
   * @returns Translated string (currently returns key as-is)
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * const greeting = shop.t('hello', { name: 'John' }); // "hello"
   * ```
   *
   * @todo Integrate with i18n library (next-intl, react-i18next, etc.)
   */
  t: (key: string, params?: Record<string, any>) => string;

  /**
   * Changes the active locale (placeholder implementation)
   *
   * @param locale - Locale code to switch to (e.g., 'en', 'uk')
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * shop.changeLocale('uk'); // Switch to Ukrainian
   * ```
   *
   * @todo Implement locale switching with router/i18n integration
   */
  changeLocale: (locale: string) => void;

  /**
   * Changes the active currency (placeholder implementation)
   *
   * @param currency - Currency code to switch to (e.g., 'USD', 'EUR')
   *
   * @example
   * ```tsx
   * const shop = useShop();
   * shop.changeCurrency('EUR'); // Switch to Euro
   * ```
   *
   * @todo Implement currency switching with state management
   */
  changeCurrency: (currency: string) => void;
}

/**
 * Return type of the useShop hook
 * Combines shop configuration with utility methods
 */
export type UseShopReturn = ShopConfig & ShopUtilities;

/**
 * Hook for accessing global shop configuration and utilities
 *
 * Provides access to shop settings, localization, and helper functions
 * throughout the application. Must be used within a ShopProvider.
 *
 * @returns Shop configuration object with utility methods
 * @throws Error if used outside of ShopProvider
 *
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const shop = useShop();
 *
 *   return (
 *     <div>
 *       <h2>{product.name}</h2>
 *       <p>{shop.formatMoney(product.price)}</p>
 *       <p>Shop: {shop.name}</p>
 *       {shop.hasFeature('cart') && (
 *         <button>Add to Cart</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useShop(): UseShopReturn {
  const config = useContext(ShopContext);

  if (!config) {
    throw new Error('useShop must be used within ShopProvider');
  }

  // Memoize utility functions to prevent unnecessary re-renders
  const utilities = useMemo(
    (): ShopUtilities => ({
      /**
       * Format money according to currency settings
       */
      formatMoney: (amount: number, currency?: Currency): string => {
        const curr = currency || config.currency;

        // Format the number with proper decimal places
        const formatted = amount
          .toFixed(curr.decimals)
          .replace('.', curr.decimalSeparator)
          .replace(/\B(?=(\d{3})+(?!\d))/g, curr.thousandsSeparator);

        // Apply symbol position
        return curr.symbolPosition === 'before'
          ? `${curr.symbol}${formatted}`
          : `${formatted}${curr.symbol}`;
      },

      /**
       * Format date according to shop's date format
       */
      formatDate: (date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date;

        // Extract date components
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        // Apply date format pattern
        return config.dateFormat
          .replace('DD', day)
          .replace('MM', month)
          .replace('YYYY', String(year));
      },

      /**
       * Format weight with unit
       */
      formatWeight: (weight: number): string => {
        return `${weight} ${config.weightUnit}`;
      },

      /**
       * Check if a feature is enabled
       */
      hasFeature: (feature: keyof ShopConfig['features']): boolean => {
        return config.features[feature] === true;
      },

      /**
       * Translation function (placeholder)
       * TODO: Integrate with i18n library
       */
      t: (key: string, _params?: Record<string, any>): string => {
        // Placeholder implementation
        // In a real app, this would use next-intl, react-i18next, etc.
        return key;
      },

      /**
       * Change locale (placeholder)
       * TODO: Implement with router/i18n
       */
      changeLocale: (locale: string): void => {
        // Placeholder implementation
        // In a real app, this would update the router locale and reload
        if (process.env.NODE_ENV !== 'production') {
          console.log('Changing locale to:', locale);
        }
      },

      /**
       * Change currency (placeholder)
       * TODO: Implement with state management
       */
      changeCurrency: (currency: string): void => {
        // Placeholder implementation
        // In a real app, this would update state and re-render with new currency
        if (process.env.NODE_ENV !== 'production') {
          console.log('Changing currency to:', currency);
        }
      },
    }),
    [config]
  );

  return {
    ...config,
    ...utilities,
  };
}

/**
 * Optional hook for accessing shop configuration
 *
 * Unlike useShop(), this hook does not throw an error if used outside
 * of ShopProvider. Instead, it returns null. Useful for components that
 * may or may not have access to shop context.
 *
 * @returns Shop configuration with utilities, or null if outside provider
 *
 * @example
 * ```tsx
 * function OptionalShopInfo() {
 *   const shop = useShopOptional();
 *
 *   if (!shop) {
 *     return <div>Shop information not available</div>;
 *   }
 *
 *   return <div>Shop: {shop.name}</div>;
 * }
 * ```
 */
export function useShopOptional(): UseShopReturn | null {
  const config = useContext(ShopContext);

  if (!config) {
    return null;
  }

  // If we have config, use the full useShop hook
  return useShop();
}
