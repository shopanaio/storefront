import { createHeadlessAuthRouteHandlers } from '@shopana/storefront-auth/server';
import { createAuthResourceRoute } from './resource-route';

/**
 * Headless sign-in handlers (BFF) at `/auth/headless/:action`: the storefront's own sign-in
 * forms call them, with the same server environment as the session handlers.
 */
export const { loader, action } = createAuthResourceRoute(
  createHeadlessAuthRouteHandlers()
);
