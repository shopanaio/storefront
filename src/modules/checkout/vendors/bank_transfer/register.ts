import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';

/**
 * Registers the bank_transfer payment provider module.
 */
registerModule({
  type: ProviderModuleType.Payment,
  slug: 'bank_transfer',
  loader: async () => (await import('./module.payment')).default,
});
