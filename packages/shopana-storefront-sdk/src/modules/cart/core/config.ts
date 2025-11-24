/**
 * Cart module configuration interface
 * Provides default settings for currency, locale, and cookie management
 */
export interface CartConfig {
  /**
   * Default currency code (ISO 4217)
   * @example 'USD', 'EUR', 'GBP'
   */
  defaultCurrency: string;

  /**
   * Default locale code
   * @example 'en', 'en-US', 'ru-RU'
   */
  defaultLocale: string;

  /**
   * Cookie name for storing cart ID
   * @default 'cartId'
   */
  cookieName?: string;

  /**
   * Cookie options for cart ID storage
   */
  cookieOptions?: {
    /**
     * Use secure cookies (HTTPS only)
     * @default true
     */
    secure?: boolean;

    /**
     * SameSite cookie attribute
     * @default 'strict'
     */
    sameSite?: 'strict' | 'lax' | 'none';

    /**
     * Maximum age in seconds
     * @default 2592000 (30 days)
     */
    maxAge?: number;
  };
}

/**
 * Default cart configuration
 */
export const DEFAULT_CART_CONFIG: Partial<CartConfig> = {
  cookieName: 'cartId',
  cookieOptions: {
    secure: true,
    sameSite: 'strict',
    maxAge: 3600 * 24 * 30, // 30 days
  },
};

/**
 * Merge user config with defaults
 */
export function createCartConfig(userConfig: CartConfig): Required<CartConfig> {
  return {
    defaultCurrency: userConfig.defaultCurrency,
    defaultLocale: userConfig.defaultLocale,
    cookieName: userConfig.cookieName ?? DEFAULT_CART_CONFIG.cookieName!,
    cookieOptions: {
      ...DEFAULT_CART_CONFIG.cookieOptions!,
      ...userConfig.cookieOptions,
    },
  };
}
