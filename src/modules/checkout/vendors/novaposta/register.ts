import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';

/**
 * Register delivery-related modules (shipping methods).
 */
registerModule({
  type: ProviderModuleType.Delivery,
  slug: 'novaposhta',
  loader: async () => (await import('./module.shipping')).default,
});

registerModule({
  type: ProviderModuleType.Payment,
  slug: 'novaposhta',
  loader: async () => (await import('./module.payment')).default,
});
