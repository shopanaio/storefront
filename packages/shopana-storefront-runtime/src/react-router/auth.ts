import { createStorefrontAuthRouteHandlers } from '@shopana/storefront-sdk/modules/session/server';
import { createAuthResourceRoute } from './resource-route';

/**
 * Storefront session handlers (BFF) at `/auth/:action`: sign-in, callback, token, refresh and
 * sign-out, configured from the same server environment as the Next.js routes.
 */
export const { loader, action } = createAuthResourceRoute(
  createStorefrontAuthRouteHandlers()
);
