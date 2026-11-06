import { createPwaRoutes } from '@shopana/storefront/react-router/pwa';
import runtimeApp from '@src/runtime/app';
import pwa from '../pwa';

export const loader = createPwaRoutes(runtimeApp, pwa).serviceWorkerLoader;
