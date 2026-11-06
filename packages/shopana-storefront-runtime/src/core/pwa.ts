/**
 * The installable app of a storefront: its web app manifest, built from the store and the
 * theme's overrides, and its service worker. The same under both runtimes; each serves them
 * at `MANIFEST_PATH` and `SERVICE_WORKER_PATH` from its own routes.
 */
import type { ServerAppData } from '@shopana/storefront-sdk/server/app';

export const MANIFEST_PATH = '/manifest.webmanifest';
export const SERVICE_WORKER_PATH = '/sw.js';

/** The store as the root data carries it. */
export type RuntimePwaStore = ServerAppData['store'];

export interface RuntimePwaIcon {
  src: string;
  /** `192x192`, several separated by spaces, or `any` for a vector icon. */
  sizes: string;
  type?: string;
  /** `any` by default; `maskable` icons keep their content in the inner 80% circle. */
  purpose?: 'any' | 'maskable' | 'monochrome' | 'any maskable';
}

export interface RuntimePwaShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: RuntimePwaIcon[];
}

export interface RuntimePwaScreenshot {
  src: string;
  sizes: string;
  type?: string;
  /** `wide` for desktop install dialogs, `narrow` for mobile ones. */
  form_factor?: 'wide' | 'narrow';
  label?: string;
}

/** The web app manifest the runtime serves (the members a storefront uses). */
export interface RuntimePwaManifest {
  id: string;
  name: string;
  short_name?: string;
  description?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  start_url: string;
  scope: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  display_override?: Array<
    'window-controls-overlay' | 'standalone' | 'minimal-ui' | 'browser'
  >;
  orientation?: 'any' | 'natural' | 'portrait' | 'landscape';
  theme_color?: string;
  background_color?: string;
  categories?: string[];
  icons: RuntimePwaIcon[];
  shortcuts?: RuntimePwaShortcut[];
  screenshots?: RuntimePwaScreenshot[];
}

/**
 * The theme's part of the app (`src/runtime/pwa.ts`). Everything is optional: without it the
 * manifest comes from the store (its name, description, primary color and square logo).
 */
export interface RuntimePwaDefinition {
  /**
   * The manifest over the store's: receives the one built from the store and returns the one
   * served. Runs on the server for every manifest request and with the root data of a page.
   */
  manifest?: (
    defaults: RuntimePwaManifest,
    store: RuntimePwaStore
  ) => RuntimePwaManifest;
  /**
   * `<link rel="apple-touch-icon">` of every page (180×180, without transparency): iOS takes
   * the home screen icon from it, not from the manifest. The largest manifest icon by default.
   */
  appleTouchIcon?: string;
  /**
   * A self-contained page (inline styles and images) the service worker shows for a page
   * that cannot load offline, e.g. `/offline.html` of the theme's `public`. Without it the
   * browser shows its own error.
   */
  offlinePage?: string;
}

export function defineRuntimePwa<const TPwa extends RuntimePwaDefinition>(
  pwa: TPwa
): TPwa {
  return pwa;
}

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

function imageType(url: string): string | undefined {
  const extension = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(url)?.[1]?.toLowerCase();
  return extension ? IMAGE_TYPES[extension] : undefined;
}

/** The manifest of the store alone: what `RuntimePwaDefinition.manifest` starts from. */
export function buildStoreManifest(store: RuntimePwaStore): RuntimePwaManifest {
  const logo = store.brand?.squareLogo?.image;
  const description = store.brand?.shortDescription ?? store.description;
  const icons: RuntimePwaIcon[] = logo
    ? [
        {
          src: logo.url,
          sizes:
            logo.width && logo.height ? `${logo.width}x${logo.height}` : 'any',
          type: imageType(logo.url),
          purpose: 'any',
        },
      ]
    : [];
  return {
    id: '/',
    name: store.name,
    short_name: store.name,
    ...(description ? { description } : {}),
    lang: store.defaultLocale,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    ...(store.brand?.primaryColor
      ? { theme_color: store.brand.primaryColor }
      : {}),
    background_color: '#ffffff',
    icons,
  };
}

/** The manifest served: the store's under the theme's overrides. */
export function buildPwaManifest(
  store: RuntimePwaStore,
  pwa: RuntimePwaDefinition
): RuntimePwaManifest {
  const defaults = buildStoreManifest(store);
  return pwa.manifest ? pwa.manifest(defaults, store) : defaults;
}

/** The largest square-ish raster icon: the default home screen icon of iOS. */
export function resolveAppleTouchIcon(
  manifest: RuntimePwaManifest,
  pwa: RuntimePwaDefinition
): string | undefined {
  if (pwa.appleTouchIcon) return pwa.appleTouchIcon;
  let best: { src: string; size: number } | undefined;
  for (const icon of manifest.icons) {
    if (icon.purpose && !icon.purpose.split(' ').includes('any')) continue;
    for (const size of icon.sizes.split(/\s+/)) {
      const [width] = size.split('x').map(Number);
      if (width && (!best || width > best.size)) {
        best = { src: icon.src, size: width };
      }
    }
  }
  return best?.src;
}

export function manifestResponse(manifest: RuntimePwaManifest): Response {
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      // The store's name, colors and logo change rarely; a browser checks the manifest of an
      // installed app on its own schedule anyway.
      'Cache-Control': 'public, max-age=300',
    },
  });
}

export interface ServiceWorkerOptions {
  /** Path prefixes of the build's hashed files, which never change under one address. */
  assetPrefixes: readonly string[];
  offlinePage?: string;
}

/**
 * The service worker. It caches only what cannot go stale or belong to a visitor: the
 * build's hashed files (cache first) and same-origin or CORS images and fonts (shown from the
 * cache, refreshed in the background). Pages, data (GraphQL), the session handlers and every
 * other request go to the network as they are: the server renders pages with the cart and the
 * session. A page that cannot load offline gets the theme's offline page, if it has one.
 */
export function createServiceWorkerScript({
  assetPrefixes,
  offlinePage,
}: ServiceWorkerOptions): string {
  const config = JSON.stringify({
    assetPrefixes,
    offlinePage: offlinePage ?? null,
  });
  return `'use strict';
const CONFIG = ${config};
const PREFIX = 'shopana-pwa-';
// A new version of the caching rules renames its caches; activation removes the old ones.
const CACHES = {
  assets: PREFIX + 'assets-v1',
  media: PREFIX + 'media-v1',
  offline: PREFIX + 'offline-v1',
};
const LIMITS = { assets: 400, media: 300 };

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      if (CONFIG.offlinePage) {
        const cache = await caches.open(CACHES.offline);
        await cache.add(new Request(CONFIG.offlinePage, { cache: 'reload' }));
      }
      // Nothing cached here goes stale between versions: the new worker can take over at once.
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const current = new Set(Object.values(CACHES));
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && !current.has(key)) await caches.delete(key);
      }
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

/** Keeps the newest \`limit\` entries (the cache lists them in insertion order). */
async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) {
    await cache.delete(key);
  }
}

/** Only complete, readable responses: opaque ones would take megabytes of quota each. */
async function store(cacheName, request, response) {
  if (response.status !== 200) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  await trim(cacheName, cacheName === CACHES.assets ? LIMITS.assets : LIMITS.media);
}

async function cacheFirst(event, cacheName) {
  const cached = await caches.match(event.request, { cacheName });
  if (cached) return cached;
  const response = await fetch(event.request);
  event.waitUntil(store(cacheName, event.request, response.clone()));
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const cached = await caches.match(event.request, { cacheName });
  const network = fetch(event.request).then((response) => {
    event.waitUntil(store(cacheName, event.request, response.clone()));
    return response;
  });
  if (cached) {
    event.waitUntil(network.catch(() => undefined));
    return cached;
  }
  return network;
}

async function navigate(event) {
  try {
    const preloaded = await event.preloadResponse;
    return preloaded || (await fetch(event.request));
  } catch (error) {
    const offline = await caches.match(CONFIG.offlinePage, { cacheName: CACHES.offline });
    if (offline) return offline;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    if (CONFIG.offlinePage) event.respondWith(navigate(event));
    return;
  }

  const url = new URL(request.url);
  if (
    url.origin === self.location.origin &&
    CONFIG.assetPrefixes.some((prefix) => url.pathname.startsWith(prefix))
  ) {
    event.respondWith(cacheFirst(event, CACHES.assets));
    return;
  }

  if (
    (request.destination === 'image' || request.destination === 'font') &&
    !request.headers.has('range')
  ) {
    event.respondWith(staleWhileRevalidate(event, CACHES.media));
  }
});
`;
}

export function serviceWorkerResponse(script: string): Response {
  return new Response(script, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      // The browser compares the worker with the one it runs on each check: never a cached copy.
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    },
  });
}
