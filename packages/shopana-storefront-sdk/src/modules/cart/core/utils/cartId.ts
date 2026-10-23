import {
  readCookie,
  resolveCookieAttributes,
  serializeCookie,
  type CookieAttributes,
} from '../../../../core/cookiePolicy';
import {
  DEFAULT_CART_CONFIG,
  type CartCookieOptions,
  type ResolvedCartConfig,
} from '../config';

export type CartIdUtilsConfig = Partial<
  Pick<ResolvedCartConfig, 'cookieName' | 'cookiePolicy'>
> & {
  cookieOptions?: Partial<CartCookieOptions>;
};

/**
 * Creates cart ID utilities with configuration support
 * Allows customization of cookie name, policy and options
 */
export function createCartIdUtils(config: CartIdUtilsConfig = {}) {
  const cookieName = config.cookieName ?? DEFAULT_CART_CONFIG.cookieName;
  const cookieOptions: CartCookieOptions = {
    ...DEFAULT_CART_CONFIG.cookieOptions,
    ...config.cookieOptions,
  };
  // Setting and deleting use the same attributes: a partitioned cookie is deleted only by a
  // `Set-Cookie` that is partitioned too.
  const attributes: CookieAttributes = resolveCookieAttributes(
    config.cookiePolicy ?? DEFAULT_CART_CONFIG.cookiePolicy,
    { secure: cookieOptions.secure }
  );

  return {
    /**
     * Get cart ID from cookies
     * @param serverCookies - Optional server-side cookie string (from headers)
     * @returns Cart ID or null if not found
     */
    getCartIdFromCookie(serverCookies?: string): string | null {
      if (typeof window === 'undefined') {
        return readCookie(serverCookies, cookieName);
      }
      return readCookie(document.cookie, cookieName);
    },

    /**
     * Set cart ID cookie
     * @param cartId - Cart ID to store
     */
    setCartIdCookie(cartId: string): void {
      if (typeof document === 'undefined') return;
      document.cookie = serializeCookie(cookieName, cartId, {
        ...attributes,
        maxAge: cookieOptions.maxAge,
      });
    },

    /**
     * Remove cart ID cookie
     */
    removeCartIdCookie(): void {
      if (typeof document === 'undefined') return;
      document.cookie = serializeCookie(cookieName, '', {
        ...attributes,
        maxAge: 0,
      });
    },

    /**
     * Check if cart ID exists in cookies
     * @param serverCookies - Optional server-side cookie string
     * @returns True if cart ID exists
     */
    hasCart(serverCookies?: string): boolean {
      return !!this.getCartIdFromCookie(serverCookies);
    },
  };
}

export type CartIdUtils = ReturnType<typeof createCartIdUtils>;
