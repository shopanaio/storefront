import Cookies from 'js-cookie';
import type { CartConfig } from '../config';

const DEFAULT_COOKIE_NAME = 'cartId';

export interface CartIdUtilsConfig {
  cookieName?: string;
  cookieOptions?: CartConfig['cookieOptions'];
}

/**
 * Creates cart ID utilities with configuration support
 * Allows customization of cookie name and options
 */
export function createCartIdUtils(config?: CartIdUtilsConfig) {
  const cookieName = config?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookieOptions = config?.cookieOptions ?? {
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 3600 * 24 * 30, // 30 days
  };

  return {
    /**
     * Get cart ID from cookies
     * @param serverCookies - Optional server-side cookie string (from headers)
     * @returns Cart ID or null if not found
     */
    getCartIdFromCookie(serverCookies?: string): string | null {
      if (typeof window === 'undefined') {
        // Server-side
        if (serverCookies) {
          // Create regex dynamically with cookie name
          const regex = new RegExp(`(?:^|; )${cookieName}=([^;]*)`);
          const match = serverCookies.match(regex);
          return match ? decodeURIComponent(match[1]) : null;
        }
        return null;
      }
      // Client-side
      return Cookies.get(cookieName) ?? null;
    },

    /**
     * Set cart ID cookie
     * @param cartId - Cart ID to store
     * @param customOptions - Override default cookie options
     */
    setCartIdCookie(
      cartId: string,
      customOptions?: Partial<CartConfig['cookieOptions']>
    ): void {
      const options = { ...cookieOptions, ...customOptions };
      const expiresInDays = (options.maxAge ?? 3600 * 24 * 30) / (3600 * 24);

      Cookies.set(cookieName, cartId, {
        path: '/',
        secure: options.secure ?? true,
        sameSite: options.sameSite ?? 'strict',
        expires: expiresInDays,
      });
    },

    /**
     * Remove cart ID cookie
     */
    removeCartIdCookie(): void {
      if (typeof window === 'undefined') return;
      Cookies.remove(cookieName);
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

/**
 * Default cart ID utilities (backward compatibility)
 */
export const cartIdUtils = createCartIdUtils();
