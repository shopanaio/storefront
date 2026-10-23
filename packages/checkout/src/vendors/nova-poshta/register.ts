import { ProviderModuleType } from '#checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';

/**
 * Both modules are registered under the app's carrier/provider code `nova-poshta`.
 */
registerModule({
  type: ProviderModuleType.Delivery,
  slug: 'nova-poshta',
  loader: async () => (await import('./module.shipping')).default,
});

registerModule({
  type: ProviderModuleType.Payment,
  slug: 'nova-poshta',
  loader: async () => (await import('./module.payment')).default,
});
