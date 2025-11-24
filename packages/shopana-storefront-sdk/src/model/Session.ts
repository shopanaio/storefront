import type { User } from "./User";

/**
 * Unified Session entity interface that works with both Shopify and Shopana providers
 * Contains session data with user information and authentication details
 */
export interface Session {
  session: {
    user: User | null;
    token?: string;
    expiresAt?: string;
  };
}
