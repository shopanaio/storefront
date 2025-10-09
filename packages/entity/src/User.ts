/**
 * Unified User entity interface that works with both Shopify and Shopana providers
 * Contains minimal common fields needed across the application
 */
export interface User {
  /** Unique identifier for the user */
  id: string;

  /** User's email address */
  email: string;

  /** User's first name (optional, mainly for Shopify) */
  firstName?: string;

  /** User's last name (optional, mainly for Shopify) */
  lastName?: string;
}
