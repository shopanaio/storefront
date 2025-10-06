import { registerModule } from '@src/modules/registry';

/**
 * Registers `checkout` module.
 */
registerModule('page', 'checkout', async () => {
  return await import('@src/modules/checkout/page/page');
});
