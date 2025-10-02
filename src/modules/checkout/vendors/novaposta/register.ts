import { ModuleType, registerModule } from '@src/modules/registry';

/**
 * Register delivery-related modules (shipping methods).
 */
registerModule(ModuleType.Shipping, 'novaposhta', async () => {
  const api = await import('./module.shipping');
  return api.default;
});

registerModule(ModuleType.Payment, 'novaposhta', async () => {
  const api = await import('./module.payment');
  return api.default;
});
