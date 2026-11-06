import { getStorefrontRequestContext } from '@shopana/storefront-sdk/modules/store/server';
import {
  buildPwaManifest,
  createServiceWorkerScript,
  manifestResponse,
  serviceWorkerResponse,
  type RuntimePwaDefinition,
} from '../core/pwa';
import type { RuntimeAppDefinition } from './app';

/** Vite puts the client build's hashed files under `/assets/`. */
const ASSET_PREFIXES = ['/assets/'];

/**
 * The resource routes of the installable app: the manifest, built from the store of the
 * request, and the service worker. They run under the runtime middleware, in the request
 * scope of the locale the address has (the default one: neither has a locale segment).
 */
export function createPwaRoutes(
  app: RuntimeAppDefinition,
  pwa: RuntimePwaDefinition
) {
  let script: string | undefined;
  return {
    manifestLoader: async () => {
      const { store } = await getStorefrontRequestContext(
        app.environmentConfig
      );
      return manifestResponse(buildPwaManifest(store, pwa));
    },
    serviceWorkerLoader: () => {
      script ??= createServiceWorkerScript({
        assetPrefixes: ASSET_PREFIXES,
        offlinePage: pwa.offlinePage,
      });
      return serviceWorkerResponse(script);
    },
  };
}
