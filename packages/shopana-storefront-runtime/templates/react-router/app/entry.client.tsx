import { registerServiceWorker } from '@shopana/storefront/pwa';
import { hydrateStorefront } from '@shopana/storefront/react-router/entry.client';
import { pageRoute } from './page-route';

hydrateStorefront(pageRoute);
if (import.meta.env.PROD) registerServiceWorker();
