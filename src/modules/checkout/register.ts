import { registerModule } from '@shopana/storefront-sdk/registry';

/**
 * Registers `checkout` module.
 */
registerModule({
  type: 'page',
  slug: 'checkout',
  path: '/checkout',
  loader: async () => import('@src/modules/checkout/page/page'),
});

/**
 * Auto-discover and register all checkout vendors.
 * This runs at server-side where require.context works with Turbopack.
 */
const vendorsContext = require.context('./vendors', true, /register\.(t|j)sx?$/);
vendorsContext.keys().forEach((key) => vendorsContext(key));
