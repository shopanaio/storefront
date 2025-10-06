import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { registerModule } from '@src/modules/registry';

/**
 * Registers the bank_transfer payment provider module.
 */
registerModule(ProviderModuleType.Payment, 'bank_transfer', async () => {
  const api = await import('./module.payment');
  return api.default;
});
