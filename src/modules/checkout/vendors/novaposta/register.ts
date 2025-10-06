import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { registerModule } from '@src/modules/registry';

/**
 * Register delivery-related modules (shipping methods).
 */
registerModule(ProviderModuleType.Delivery, 'novaposhta', async () => {
  const api = await import('./module.shipping');
  return api.default;
});

registerModule(ProviderModuleType.Payment, 'novaposhta', async () => {
  const api = await import('./module.payment');
  return api.default;
});
