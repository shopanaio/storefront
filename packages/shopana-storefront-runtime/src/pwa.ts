/** `@shopana/storefront/pwa`: the theme's definition of the installable app and its registration. */
export {
  defineRuntimePwa,
  MANIFEST_PATH,
  SERVICE_WORKER_PATH,
  type RuntimePwaDefinition,
  type RuntimePwaIcon,
  type RuntimePwaManifest,
  type RuntimePwaScreenshot,
  type RuntimePwaShortcut,
  type RuntimePwaStore,
} from './core/pwa';
export { registerServiceWorker } from './core/pwa-client';
