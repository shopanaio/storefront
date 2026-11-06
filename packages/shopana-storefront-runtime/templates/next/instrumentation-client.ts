import { registerServiceWorker } from '@shopana/storefront/pwa';

if (process.env.NODE_ENV === 'production') registerServiceWorker();
