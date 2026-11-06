import type { Metadata, Viewport } from 'next';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import { getStorefrontRequestContext } from '@shopana/storefront-sdk/modules/store/server';
import {
  buildPwaManifest,
  createServiceWorkerScript,
  MANIFEST_PATH,
  manifestResponse,
  resolveAppleTouchIcon,
  serviceWorkerResponse,
  type RuntimePwaDefinition,
  type RuntimePwaStore,
} from '../core/pwa';

/** Next.js serves the client build's hashed files under `/_next/static/`. */
const ASSET_PREFIXES = ['/_next/static/'];

/**
 * The route handlers of the installable app: `app/manifest.webmanifest/route.ts`, built from
 * the store (in its default language: the middleware leaves static addresses alone), and
 * `app/sw.js/route.ts`.
 */
export function createPwaRouteHandlers(options: {
  environmentConfig: ApolloEnvironmentConfig;
  pwa: RuntimePwaDefinition;
}) {
  const { environmentConfig, pwa } = options;
  let script: string | undefined;
  return {
    manifest: async () => {
      const { store } = await getStorefrontRequestContext(environmentConfig);
      return manifestResponse(buildPwaManifest(store, pwa));
    },
    serviceWorker: () => {
      script ??= createServiceWorkerScript({
        assetPrefixes: ASSET_PREFIXES,
        offlinePage: pwa.offlinePage,
      });
      return serviceWorkerResponse(script);
    },
  };
}

/**
 * What the root layout's `generateMetadata` and `generateViewport` add for the installable
 * app: the manifest link, the home screen title and icon of iOS, and the theme color.
 */
export function pwaMetadata(
  store: RuntimePwaStore,
  pwa: RuntimePwaDefinition
): { metadata: Metadata; viewport: Viewport } {
  const manifest = buildPwaManifest(store, pwa);
  const title = manifest.short_name ?? manifest.name;
  const appleTouchIcon = resolveAppleTouchIcon(manifest, pwa);
  return {
    metadata: {
      manifest: MANIFEST_PATH,
      applicationName: title,
      appleWebApp: { capable: true, title },
      ...(appleTouchIcon ? { icons: { apple: appleTouchIcon } } : {}),
      other: { 'mobile-web-app-capable': 'yes' },
    },
    viewport: manifest.theme_color ? { themeColor: manifest.theme_color } : {},
  };
}
