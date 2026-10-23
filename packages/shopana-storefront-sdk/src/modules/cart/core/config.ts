import {
  DEFAULT_COOKIE_POLICY,
  type CookiePolicy,
} from '../../../core/cookiePolicy';
/**
 * Cart module configuration interface
 * Provides settings for the sales channel and cookie management. The language and currency of
 * the cart follow the active localization passed to `CartProvider`.
 */
export interface CartConfig {
  /**
   * Canonical sales channel used for checkout pricing and eligibility.
   * @example 'online-store'
   */
  channelCode: string;
  /**
   * Cookie name for storing cart ID
   * @default 'cartId'
   */
  cookieName?: string;
  /**
   * Where the storefront runs: `embedded` writes the cart cookie with
   * `SameSite=None; Secure; Partitioned` for a third-party iframe.
   * @default 'first-party'
   */
  cookiePolicy?: CookiePolicy;
  /**
   * Cookie options for cart ID storage
   */
  cookieOptions?: {
    /**
     * Use secure cookies (HTTPS only); the embedded policy is always Secure.
     * @default true
     */
    secure?: boolean;
    /**
     * Maximum age in seconds
     * @default 2592000 (30 days)
     */
    maxAge?: number;
  };
}

export type CartCookieOptions = Required<
  NonNullable<CartConfig['cookieOptions']>
>;

/**
 * Default cart configuration
 */
export const DEFAULT_CART_CONFIG = {
  cookieName: 'cartId',
  cookiePolicy: DEFAULT_COOKIE_POLICY,
  cookieOptions: {
    secure: true,
    maxAge: 3600 * 24 * 30, // 30 days
  },
} satisfies Omit<Required<CartConfig>, 'channelCode'>;

export interface ResolvedCartConfig {
  channelCode: string;
  cookieName: string;
  cookiePolicy: CookiePolicy;
  cookieOptions: CartCookieOptions;
}

/**
 * Merge user config with defaults
 */
export function createCartConfig(userConfig: CartConfig): ResolvedCartConfig {
  return {
    channelCode: userConfig.channelCode,
    cookieName: userConfig.cookieName ?? DEFAULT_CART_CONFIG.cookieName,
    cookiePolicy: userConfig.cookiePolicy ?? DEFAULT_CART_CONFIG.cookiePolicy,
    cookieOptions: {
      ...DEFAULT_CART_CONFIG.cookieOptions,
      ...userConfig.cookieOptions,
    },
  };
}
