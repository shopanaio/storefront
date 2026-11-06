import type { MetaDescriptor } from 'react-router';
import {
  buildPwaManifest,
  resolveAppleTouchIcon,
  type RuntimePwaDefinition,
  type RuntimePwaStore,
} from '../core/pwa';

/**
 * The tags of every page that make the app installable and name it on a home screen; the
 * theme's own tags with the same name replace them.
 */
export function pwaMetaDescriptors(
  store: RuntimePwaStore,
  pwa: RuntimePwaDefinition
): MetaDescriptor[] {
  const manifest = buildPwaManifest(store, pwa);
  const title = manifest.short_name ?? manifest.name;
  const appleTouchIcon = resolveAppleTouchIcon(manifest, pwa);
  return [
    { name: 'application-name', content: title },
    { name: 'apple-mobile-web-app-title', content: title },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    ...(manifest.theme_color
      ? [{ name: 'theme-color', content: manifest.theme_color }]
      : []),
    ...(appleTouchIcon
      ? [{ tagName: 'link', rel: 'apple-touch-icon', href: appleTouchIcon }]
      : []),
  ];
}
