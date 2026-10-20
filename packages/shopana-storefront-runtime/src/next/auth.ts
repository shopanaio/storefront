import { createStorefrontAuthRouteHandlers } from '@shopana/storefront-sdk/modules/session/server';

/**
 * Storefront session handlers (BFF) mounted at `/auth/[action]`: sign-in, callback, token,
 * refresh and sign-out. Configured from the server environment (`IAM_OAUTH_CLIENT_ID`,
 * `IAM_OAUTH_CLIENT_SECRET`, `IAM_OAUTH_RESOURCE`, `IAM_OAUTH_REDIRECT_URI`,
 * `STOREFRONT_SESSION_SECRET`, with `NEXT_PUBLIC_IAM_URL` and
 * `NEXT_PUBLIC_IAM_APPLICATION_ID`).
 */
export const { GET, POST } = createStorefrontAuthRouteHandlers();
