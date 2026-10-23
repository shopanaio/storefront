import { createHeadlessAuthRouteHandlers } from '@shopana/storefront-auth/server';

/**
 * Headless sign-in handlers (BFF) mounted at `/auth/headless/[action]`: the storefront's own
 * sign-in forms call them, and they call the IAM headless API with the client secret. They use
 * the same server environment as the session handlers at `/auth/[action]`.
 */
export const { GET, POST } = createHeadlessAuthRouteHandlers();
