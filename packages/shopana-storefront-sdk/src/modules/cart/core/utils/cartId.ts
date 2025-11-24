import Cookies from 'js-cookie';

const CART_ID_COOKIE_NAME = 'cartId';

/**
 * Utility functions for managing cart ID in cookies
 * Works both on client and server (SSR)
 */
export const cartIdUtils = {
  /**
   * Get cart ID from cookies
   * @param serverCookies - Optional server-side cookie string (from headers)
   * @returns Cart ID or null if not found
   */
  getCartIdFromCookie(serverCookies?: string): string | null {
    if (typeof window === 'undefined') {
      // Server-side
      if (serverCookies) {
        const match = serverCookies.match(/(?:^|; )cartId=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
      }
      return null;
    }
    // Client-side
    return Cookies.get(CART_ID_COOKIE_NAME) ?? null;
  },

  /**
   * Set cart ID cookie
   * @param cartId - Cart ID to store
   * @param options - Cookie options
   */
  setCartIdCookie(
    cartId: string,
    options: {
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      maxAge?: number;
    } = {}
  ): void {
    const {
      secure = true,
      sameSite = 'strict' as const,
      maxAge = 3600 * 24 * 30, // 30 days
    } = options;

    const expiresInDays = maxAge / (3600 * 24);

    Cookies.set(CART_ID_COOKIE_NAME, cartId, {
      path: '/',
      secure,
      sameSite,
      expires: expiresInDays,
    });
  },

  /**
   * Remove cart ID cookie
   */
  removeCartIdCookie(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove(CART_ID_COOKIE_NAME);
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
