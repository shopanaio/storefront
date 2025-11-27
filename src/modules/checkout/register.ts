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
