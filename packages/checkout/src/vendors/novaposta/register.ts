import { ProviderModuleType } from '#checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';

/**
 * Register delivery-related modules (shipping methods).
 */
registerModule({
  type: ProviderModuleType.Delivery,
  slug: 'novaposhta',
  loader: async () => (await import('./module.shipping')).default,
});

/**
 * Register the payment module (cash on delivery) under the app provider code.
 */
registerModule({
  type: ProviderModuleType.Payment,
  slug: 'nova-poshta',
  loader: async () => (await import('./module.payment')).default,
});
