import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import type { CartConfig } from '@shopana/storefront-sdk/modules/cart/core/config';
import type { StorefrontRoutingConfig } from '@shopana/storefront-sdk/routing';
import type { AppPreloadConfig } from '@shopana/storefront-sdk/server/app';

/**
 * The storefront app of a React Router theme (`src/runtime/app.ts`): what the Next.js runtime
 * reads from the middleware and `AppProvider` props. The middleware matches the locale segment
 * against the store languages and applies `routing`; the root loader loads the store, cart,
 * session and `preload` queries; the root providers use the environment and cart config.
 * Everything here reaches the browser.
 */
export interface RuntimeAppDefinition {
  environmentConfig: ApolloEnvironmentConfig;
  routing: StorefrontRoutingConfig;
  cartConfig: CartConfig;
  preload?: AppPreloadConfig;
}

export function defineRuntimeApp<const TApp extends RuntimeAppDefinition>(
  app: TApp
): TApp {
  return app;
}
