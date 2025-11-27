import { registerModule } from '@src/modules/registry';

/**
 * Registers `checkout` module.
 */
registerModule('page', 'checkout', async () => {
  return await import('@src/modules/checkout/page/page');
});

/**
 * Auto-discover and register all checkout vendors.
 * This runs at server-side where require.context works with Turbopack.
 */
const vendorsContext = require.context('./vendors', true, /register\.(t|j)sx?$/);
vendorsContext.keys().forEach((key) => vendorsContext(key));
