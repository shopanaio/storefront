import { describe, expect, it } from 'vitest';
import {
  buildPwaManifest,
  buildStoreManifest,
  createServiceWorkerScript,
  resolveAppleTouchIcon,
  type RuntimePwaStore,
} from './pwa';

const store = {
  name: 'Socks & Co',
  description: 'Socks for everyone',
  defaultLocale: 'uk',
  brand: {
    primaryColor: '#123456',
    shortDescription: 'Warm socks',
    squareLogo: {
      image: { url: 'https://cdn.test/logo.png', width: 512, height: 512 },
    },
  },
} as unknown as RuntimePwaStore;

describe('the store manifest', () => {
  it('names, colors and draws the app from the store', () => {
    expect(buildStoreManifest(store)).toMatchObject({
      id: '/',
      name: 'Socks & Co',
      short_name: 'Socks & Co',
      description: 'Warm socks',
      lang: 'uk',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#123456',
      icons: [
        {
          src: 'https://cdn.test/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
      ],
    });
  });

  it('has no icons or theme color the store lacks', () => {
    const plain = { ...store, brand: null } as unknown as RuntimePwaStore;
    const manifest = buildStoreManifest(plain);
    expect(manifest.icons).toEqual([]);
    expect(manifest.theme_color).toBeUndefined();
    expect(manifest.description).toBe('Socks for everyone');
  });
});

describe('the theme overrides', () => {
  it('receive the store manifest and replace it', () => {
    const manifest = buildPwaManifest(store, {
      manifest: (defaults) => ({
        ...defaults,
        short_name: 'Socks',
        icons: [{ src: '/icons/192.png', sizes: '192x192' }],
      }),
    });
    expect(manifest.name).toBe('Socks & Co');
    expect(manifest.short_name).toBe('Socks');
    expect(manifest.icons).toEqual([
      { src: '/icons/192.png', sizes: '192x192' },
    ]);
  });

  it('take the largest regular icon for iOS unless one is given', () => {
    const manifest = buildPwaManifest(store, {
      manifest: (defaults) => ({
        ...defaults,
        icons: [
          { src: '/192.png', sizes: '192x192' },
          { src: '/512.png', sizes: '512x512' },
          { src: '/maskable.png', sizes: '1024x1024', purpose: 'maskable' },
        ],
      }),
    });
    expect(resolveAppleTouchIcon(manifest, {})).toBe('/512.png');
    expect(
      resolveAppleTouchIcon(manifest, { appleTouchIcon: '/180.png' })
    ).toBe('/180.png');
  });
});

describe('the service worker', () => {
  it('carries its asset prefixes and offline page', () => {
    const script = createServiceWorkerScript({
      assetPrefixes: ['/assets/'],
      offlinePage: '/offline.html',
    });
    expect(script).toContain(
      'const CONFIG = {"assetPrefixes":["/assets/"],"offlinePage":"/offline.html"};'
    );
    // Valid JavaScript.
    expect(() => new Function(script)).not.toThrow();
  });
});
