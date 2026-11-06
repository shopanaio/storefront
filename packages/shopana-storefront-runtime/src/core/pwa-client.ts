import { SERVICE_WORKER_PATH } from './pwa';

/**
 * Registers the storefront's service worker once the page has loaded, so it never competes
 * with the page's own requests. Does nothing where service workers are unavailable (an
 * insecure origin, a private window of some browsers). The generated client entries call it
 * in production builds only: a worker left over from a build would get in the way of the dev
 * server.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const register = () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: '/' })
      .catch((error: unknown) => {
        console.warn('The service worker did not register.', error);
      });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
